

const LegalPrivacy = () => {
  return (
    <div className="p-8 bg-black text-gray-300 max-w-2xl mx-auto rounded-xl border border-purple-900/30">
      <h2 className="text-2xl font-bold text-white mb-4">Privacy Policy</h2>
      <p className="mb-4">LinkVibez uses <strong>Supabase</strong> and <strong>Google OAuth</strong> for secure authentication.</p>
      <ul className="list-disc ml-6 space-y-2 mb-4">
        <li>We collect your name, email, and profile photo solely to create your account.</li>
        <li>We use geolocation data only to show you nearby matches.</li>
        <li>We do <strong>not</strong> sell or share your personal data with third parties.</li>
      </ul>
      <p className="text-sm text-gray-500 italic">Last updated: January 2026</p>
    </div>
  );
};

export default LegalPrivacy;