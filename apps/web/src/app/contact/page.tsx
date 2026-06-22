'use client';

import { useState } from 'react';
import { submitLead } from '@/lib/api';

const INTENT_OPTIONS = [
  { value: 'browsing', label: 'Just browsing' },
  { value: 'tour_weekend', label: 'Tour this weekend' },
  { value: 'buying_1_3_months', label: 'Buying in 1–3 months' },
  { value: 'selling', label: 'Selling / listing' },
];

const BUDGET_OPTIONS = [
  { value: 'under_800k', label: 'Under $800k' },
  { value: '800k_1m', label: '$800k – $1M' },
  { value: 'over_1m', label: '$1M+' },
];

const AREA_OPTIONS = [
  'Seattle',
  'Bellevue',
  'Kirkland',
  'Redmond',
  'Issaquah',
  'Renton',
  'Mercer Island',
  'Other',
];

export default function Contact() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    intent: '',
    budgetRange: '',
    areas: [] as string[],
    message: '',
    name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleAreaToggle = (area: string) => {
    setFormData(prev => ({
      ...prev,
      areas: prev.areas.includes(area)
        ? prev.areas.filter(a => a !== area)
        : [...prev.areas, area],
    }));
  };

  const handleNext = () => {
    if (step === 1 && !formData.intent) {
      setError('Please select an option');
      return;
    }
    if (step === 2 && !formData.budgetRange) {
      setError('Please select a budget range');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: `Intent: ${formData.intent}\nBudget: ${formData.budgetRange}\nAreas: ${formData.areas.join(', ') || 'Not specified'}\n\n${formData.message}`,
        source: 'contact_stepper',
      };

      console.log('Lead payload:', payload);

      const result = await submitLead(payload);

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setStep(1);
    setFormData({
      intent: '',
      budgetRange: '',
      areas: [],
      message: '',
      name: '',
      email: '',
      phone: '',
    });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Let's Find Your Home
        </h1>
        <p className="text-gray-600 mb-8">
          Tell us about what you're looking for and we'll help you find the perfect match.
        </p>

        {/* Progress Bar */}
        {!success && (
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    s === step
                      ? 'bg-blue-600 text-white'
                      : s < step
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s < step ? '✓' : s}
                </div>
              ))}
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-8">
          {success ? (
            /* Success State */
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✓</div>
              <h3 className="text-xl font-bold text-green-600 mb-2">
                Thank You!
              </h3>
              <p className="text-gray-600 mb-6">
                We've received your information and will contact you soon.
              </p>
              <button
                onClick={resetForm}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <>
              {/* Step 1: Intent */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    What are you looking for?
                  </h2>
                  <div className="space-y-3">
                    {INTENT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFormData({ ...formData, intent: option.value })}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                          formData.intent === option.value
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Budget */}
              {step === 2 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    What's your budget range?
                  </h2>
                  <div className="space-y-3">
                    {BUDGET_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFormData({ ...formData, budgetRange: option.value })}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                          formData.budgetRange === option.value
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Areas + Contact Info */}
              {step === 3 && (
                <form onSubmit={handleSubmit}>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Preferred areas & contact info
                  </h2>

                  {/* Areas */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Areas (select all that apply)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {AREA_OPTIONS.map((area) => (
                        <button
                          key={area}
                          type="button"
                          onClick={() => handleAreaToggle(area)}
                          className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                            formData.areas.includes(area)
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {area}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Message
                    </label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Any specific requirements or questions?"
                    />
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="(206) 555-0100"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400"
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </form>
              )}

              {/* Navigation Buttons */}
              {step < 3 && (
                <div className="mt-6 flex justify-between">
                  {step > 1 ? (
                    <button
                      onClick={handleBack}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      ← Back
                    </button>
                  ) : (
                    <div />
                  )}
                  <button
                    onClick={handleNext}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Next →
                  </button>
                </div>
              )}

              {step === 3 && (
                <button
                  onClick={handleBack}
                  className="mt-4 px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  ← Back
                </button>
              )}

              {error && step < 3 && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
