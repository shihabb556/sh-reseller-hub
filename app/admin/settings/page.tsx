'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/shared';
import { toast } from 'react-hot-toast';

export default function AdminSettingsPage() {
    const [advanceOption, setAdvanceOption] = useState('Unpaid');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/admin/settings');
                if (res.ok) {
                    const data = await res.json();
                    setAdvanceOption(data.advanceOption);
                }
            } catch (error) {
                console.error('Failed to fetch settings');
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ advanceOption }),
            });
            if (res.ok) {
                toast.success('Settings updated successfully');
            } else {
                toast.error('Failed to update settings');
            }
        } catch (error) {
            toast.error('Error updating settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading settings...</div>;

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">General Settings</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Configure global application settings and options.
                </p>
            </div>

            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Advance Payment Option</h3>
                    <div className="mt-2 max-w-xl text-sm text-gray-500">
                        <p>
                            When set to <strong>"Paid"</strong>, customers will be required to pay 100 Taka advance
                            and provide a Transaction ID (TrxID) during checkout.
                        </p>
                    </div>
                    <div className="mt-5">
                        <div className="flex items-center space-x-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio h-4 w-4 text-indigo-600"
                                    name="advanceOption"
                                    value="Unpaid"
                                    checked={advanceOption === 'Unpaid'}
                                    onChange={(e) => setAdvanceOption(e.target.value)}
                                />
                                <span className="ml-2 text-gray-700">Unpaid (COD only)</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio h-4 w-4 text-indigo-600"
                                    name="advanceOption"
                                    value="Paid"
                                    checked={advanceOption === 'Paid'}
                                    onChange={(e) => setAdvanceOption(e.target.value)}
                                />
                                <span className="ml-2 text-gray-700">Paid (100 TK Advance)</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </div>
    );
}
