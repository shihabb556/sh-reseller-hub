import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import { User, LoginAttempt } from "@/models/schema";
import { headers } from "next/headers";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                await dbConnect();

                const headersList = await headers();
                const ip = headersList.get("x-forwarded-for") || "unknown";
                const userAgent = headersList.get("user-agent") || "unknown";

                // 1. IP Rate Limiting Check
                const ipAttempt = await LoginAttempt.findOne({ ip });
                if (ipAttempt && ipAttempt.lockUntil && ipAttempt.lockUntil > new Date()) {
                    throw new Error(`LOCKOUT|${ipAttempt.lockUntil.getTime()}|Global rate limit exceeded. Try again in 10s.`);
                }

                // 2. User Lockout Check
                const user = await User.findOne({ email: credentials.email.toLowerCase() });

                if (!user) {
                    throw new Error("No user found with this email");
                }

                if (!user.isActive) {
                    throw new Error("Account has been deactivated");
                }

                if (user.lockUntil && user.lockUntil > new Date()) {
                    throw new Error(`LOCKOUT|${user.lockUntil.getTime()}|Account locked. Try again in 10s.`);
                }

                const isPasswordCorrect = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordCorrect) {
                    try {
                        // Update User attempts
                        let userLockDate: Date | null = null;
                        if (user.loginAttempts + 1 >= 10) {
                            userLockDate = new Date(Date.now() + 10 * 1000); // 10 seconds for testing
                            await User.findByIdAndUpdate(user._id, {
                                $set: { lockUntil: userLockDate, loginAttempts: 0 }
                            });
                        } else {
                            await User.findByIdAndUpdate(user._id, {
                                $inc: { loginAttempts: 1 }
                            });
                        }

                        // Update IP attempts
                        let ipLockDate: Date | null = null;
                        const currentIpAttempts = (ipAttempt?.attempts || 0) + 1;
                        if (currentIpAttempts >= 20) {
                            ipLockDate = new Date(Date.now() + 10 * 1000); // 10 seconds for testing
                            await LoginAttempt.findOneAndUpdate({ ip }, {
                                $set: { lockUntil: ipLockDate, attempts: 0, userAgent }
                            }, { upsert: true });
                        } else {
                            await LoginAttempt.findOneAndUpdate({ ip }, {
                                $inc: { attempts: 1 },
                                $set: { userAgent }
                            }, { upsert: true });
                        }

                        if (userLockDate) {
                            throw new Error(`LOCKOUT|${userLockDate.getTime()}|Too many failed attempts. Account locked.`);
                        }
                        if (ipLockDate) {
                            throw new Error(`LOCKOUT|${ipLockDate.getTime()}|IP temporarily blocked.`);
                        }
                    } catch (dbErr: any) {
                        if (dbErr.message.startsWith('LOCKOUT')) throw dbErr;
                        console.error('Lockout update error:', dbErr);
                        // Fall through to generic error
                    }

                    throw new Error("Invalid password");
                }

                // Successful login - reset
                await Promise.all([
                    User.findByIdAndUpdate(user._id, { $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } }),
                    LoginAttempt.findOneAndDelete({ ip })
                ]);

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        }
    },
    pages: {
        signIn: '/auth/login',
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
