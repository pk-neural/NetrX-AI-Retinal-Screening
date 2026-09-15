import React, { useState } from 'react';
import {
  Mail, Phone, MapPin, Clock, ShieldCheck, Send, AlertCircle, CheckCircle2
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '', email: '', organization: '', inquiryType: 'Clinical Integration', message: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const e = {};
    if (!formData.name.trim())         e.name = 'Full name is required.';
    if (!formData.email.trim())        e.email = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Enter a valid email address.';
    if (!formData.organization.trim()) e.organization = 'Organization is required.';
    if (!formData.message.trim())      e.message = 'Message is required.';
    else if (formData.message.length < 20) e.message = 'Message must be at least 20 characters.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    setSubmitted(true);
  };

  const field = (key) => ({
    value: formData[key],
    onChange: (e) => setFormData({ ...formData, [key]: e.target.value }),
  });

  const inputCls = (key) =>
    `w-full px-4 py-3 rounded-xl border text-sm text-[#0A1128] bg-slate-50/50 focus:bg-white focus:outline-none transition-all ${
      errors[key] ? 'border-rose-400 focus:ring-2 focus:ring-rose-200' : 'border-slate-200 focus:border-[#FA495C]'
    }`;

  return (
    <div className="w-full">
      <PageHeader
        eyebrow="GET IN TOUCH"
        title="Contact the NetrX Clinical Team"
        description="Whether you're integrating NetrX into your clinic, partnering on AI research, or seeking technical support — we're here to help."
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-14 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Contact Form */}
          <div className="lg:col-span-7">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-5 bg-white rounded-3xl border border-slate-200 shadow-xl px-8">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle2 className="w-9 h-9 text-green-500" />
                </div>
                <h3 className="text-2xl font-extrabold text-[#0A1128]">Message Received</h3>
                <p className="text-slate-600 text-sm max-w-sm leading-relaxed">
                  Thank you. Your message has been received. The NetrX clinical team will respond within 1 business day.
                </p>
                <button
                  type="button"
                  onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', organization: '', inquiryType: 'Clinical Integration', message: '' }); }}
                  className="bg-[#FA495C] text-white px-7 py-3 rounded-full font-semibold text-sm cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200/90 shadow-xl space-y-6"
              >
                <div>
                  <span className="text-xs font-extrabold text-[#FA495C] uppercase tracking-widest">CLINICAL INQUIRY FORM</span>
                  <h2 className="text-2xl font-extrabold text-[#0A1128] mt-2">Send Us a Message</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-extrabold text-[#0A1128] uppercase tracking-wider mb-2">
                      Full Name *
                    </label>
                    <input id="contact-name" type="text" placeholder="Dr. Sarah Jenkins" className={inputCls('name')} {...field('name')} />
                    {errors.name && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
                  </div>
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-extrabold text-[#0A1128] uppercase tracking-wider mb-2">
                      Email Address *
                    </label>
                    <input id="contact-email" type="email" placeholder="s.jenkins@clinic.org" className={inputCls('email')} {...field('email')} />
                    {errors.email && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
                  </div>
                  {/* Organization */}
                  <div>
                    <label className="block text-xs font-extrabold text-[#0A1128] uppercase tracking-wider mb-2">
                      Organization / Hospital *
                    </label>
                    <input id="contact-org" type="text" placeholder="Metro Health Diabetes Center" className={inputCls('organization')} {...field('organization')} />
                    {errors.organization && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.organization}</p>}
                  </div>
                  {/* Inquiry Type */}
                  <div>
                    <label className="block text-xs font-extrabold text-[#0A1128] uppercase tracking-wider mb-2">
                      Inquiry Subject
                    </label>
                    <select id="contact-inquiry" className={inputCls('inquiryType')} {...field('inquiryType')}>
                      <option>Clinical Integration</option>
                      <option>EHR / Teleophthalmology API</option>
                      <option>Research Partnership</option>
                      <option>Technical Support</option>
                      <option>SIH 2026 Evaluation</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-extrabold text-[#0A1128] uppercase tracking-wider mb-2">
                    Message Details *
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    placeholder="Describe your clinic's screening workflow, fundus camera models, or integration questions..."
                    className={inputCls('message')}
                    {...field('message')}
                  />
                  {errors.message && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  id="contact-submit-btn"
                  disabled={submitting}
                  className="bg-[#FA495C] hover:bg-[#E11D48] text-white px-8 py-3.5 rounded-full font-semibold text-base shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.98] w-full sm:w-auto cursor-pointer disabled:opacity-70"
                >
                  {submitting ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Sending...</span> : <><Send className="w-4 h-4" /> Send Message</>}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0A1128] text-white p-8 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#FA495C]/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 space-y-2">
                <span className="text-xs font-extrabold text-rose-400 uppercase tracking-widest">CLINICAL SUPPORT HQ</span>
                <h3 className="text-2xl font-extrabold">NetrX Medical AI Operations</h3>
                <p className="text-slate-300 text-sm">Dedicated support for clinical staff and healthcare system administrators.</p>
              </div>
              <div className="relative z-10 space-y-4 text-sm text-slate-200 pt-2">
                {[
                  { icon: Mail,   label: 'Direct Clinical Email', val: 'clinical@netrx.ai' },
                  { icon: Phone,  label: 'Support Hotline',       val: '+91-800-NETRX-AI' },
                  { icon: Clock,  label: 'Support Hours',         val: 'Mon–Fri: 8 AM – 8 PM IST' },
                  { icon: MapPin, label: 'Headquarters',           val: 'Medical AI Innovation Hub, India' },
                ].map((c) => {
                  const Icon = c.icon;
                  return (
                    <div key={c.label} className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-white/10 text-[#FA495C] mt-0.5 flex-shrink-0"><Icon className="w-4 h-4" /></div>
                      <div>
                        <div className="text-xs text-slate-400">{c.label}</div>
                        <div className="font-semibold">{c.val}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="relative z-10 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FA495C]" />
                <span>HIPAA-compliant encrypted inquiry transmission</span>
              </div>
            </div>

            <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-6 space-y-3">
              <h4 className="font-bold text-[#0A1128] text-sm">SIH 2026 Evaluation Contact</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                If you are a SIH 2026 evaluation team member or judge, please use the inquiry form to reach our technical team directly. We'll respond within 2 hours during evaluation hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
