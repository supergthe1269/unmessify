import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { calculateDailyBudget, calculateSafeLimit } from '../utils/algorithms';
import '../styles/ProfileSetup.css';

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { updateUser, user } = useUser();
  const { authUser, signOut } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    monthlyLimit: user?.monthlyLimit || 5000,
    preference: user?.preference || 'both',
    diet: user?.diet || 'mixed',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'monthlyLimit' ? parseInt(value) : value,
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateStep = () => {
    const newErrors = {};

    if (step === 2) {
      if (formData.monthlyLimit < 100) {
        newErrors.monthlyLimit = 'Monthly limit must be at least 100 credits';
      }
      if (formData.monthlyLimit > 10000) {
        newErrors.monthlyLimit = 'Monthly limit cannot exceed 10000 credits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep()) {
      const userData = {
        ...formData,
        name: authUser?.displayName || 'User',
        email: authUser?.email,
        photoURL: authUser?.photoURL,
        dailyBudget: calculateDailyBudget(formData.monthlyLimit),
        safeLimit: calculateSafeLimit(formData.monthlyLimit),
        currentMonthStart: new Date().toISOString(),
      };
      await updateUser(userData);
      // Navigate to dashboard immediately after data settles
      navigate('/dashboard', { replace: true });
    }
  };

  const dailyBudget = calculateDailyBudget(formData.monthlyLimit);
  const safeLimit = calculateSafeLimit(formData.monthlyLimit);

  return (
    <div className="profile-setup">
      <div className="setup-container">
        <div className="progress-bar">
          <div className="progress" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Confirmation */}
          {step === 1 && (
            <div className="setup-step">
              <h2>Welcome to UNMESSIFY!</h2>
              <p className="subtitle">Let's set up your profile</p>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px', padding: '20px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)' }}>
                {authUser?.photoURL && (
                  <img
                    src={authUser.photoURL}
                    alt="Profile"
                    referrerPolicy="no-referrer"
                    style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '16px', border: '3px solid var(--primary-500)' }}
                  />
                )}
                <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>{authUser?.displayName}</h3>
                <p style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>{authUser?.email}</p>
                <div style={{ display: 'inline-flex', alignItems: 'center', background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                  ✓ VIT Student Verified
                </div>
              </div>

              <div className="button-group" style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <button type="button" onClick={() => signOut()} className="btn btn-secondary">
                  Not you? Sign Out
                </button>
                <button type="button" onClick={handleNext} className="btn btn-primary" style={{ flex: 1 }}>
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Budget */}
          {step === 2 && (
            <div className="setup-step">
              <h2>Set Your Monthly Budget</h2>
              <p className="subtitle">How many credits do you want per month?</p>

              <div className="form-group">
                <label htmlFor="monthlyLimit">Monthly Budget (Credits)</label>
                <input
                  type="number"
                  id="monthlyLimit"
                  name="monthlyLimit"
                  value={formData.monthlyLimit}
                  onChange={handleChange}
                  min="100"
                  max="10000"
                  className={errors.monthlyLimit ? 'error' : ''}
                />
                {errors.monthlyLimit && <span className="error-text">{errors.monthlyLimit}</span>}

                <div className="budget-info">
                  <div className="info-box">
                    <p className="label">Daily Budget</p>
                    <p className="value">{dailyBudget} credits</p>
                  </div>
                  <div className="info-box">
                    <p className="label">Safe Limit (70%)</p>
                    <p className="value">{safeLimit} credits</p>
                  </div>
                </div>
              </div>

              <div className="button-group">
                <button type="button" onClick={() => setStep(1)} className="btn btn-secondary">
                  Back
                </button>
                <button type="button" onClick={handleNext} className="btn btn-primary">
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {step === 3 && (
            <div className="setup-step">
              <h2>Your Preferences</h2>
              <p className="subtitle">Customize your meal recommendations</p>

              <div className="form-group">
                <label>Food Preference</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="preference"
                      value="veg"
                      checked={formData.preference === 'veg'}
                      onChange={handleChange}
                    />
                    <span>Vegetarian</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="preference"
                      value="non-veg"
                      checked={formData.preference === 'non-veg'}
                      onChange={handleChange}
                    />
                    <span>Non-Vegetarian</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="preference"
                      value="both"
                      checked={formData.preference === 'both'}
                      onChange={handleChange}
                    />
                    <span>Both</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Diet Type</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="diet"
                      value="mixed"
                      checked={formData.diet === 'mixed'}
                      onChange={handleChange}
                    />
                    <span>Mixed</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="diet"
                      value="light"
                      checked={formData.diet === 'light'}
                      onChange={handleChange}
                    />
                    <span>Light</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="diet"
                      value="heavy"
                      checked={formData.diet === 'heavy'}
                      onChange={handleChange}
                    />
                    <span>Heavy</span>
                  </label>
                </div>
              </div>

              <div className="button-group">
                <button type="button" onClick={() => setStep(2)} className="btn btn-secondary">
                  Back
                </button>
                <button type="submit" className="btn btn-primary btn-success">
                  Complete Setup
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
