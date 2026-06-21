import './PrivacyPolicy.css';

export default function PrivacyPolicy() {
  return (
    <div className="privacy-container">
      <h1>Privacy Policy</h1>
      <p>Last updated: April 10, 2025</p>

      <p>
        Win The Day values your privacy. This Privacy Policy explains how we collect, use,
        and protect your information when you use our mobile app and website.
      </p>

      <h2>Information We Collect</h2>
      <p>
        We do not collect personally identifiable information unless you choose to sign in using
        Google or Apple. Your streak data, task lists, and customization preferences are stored securely
        and associated with your user ID.
      </p>

      <h2>How We Use Your Data</h2>
      <p>
        Your data is used to provide and personalize your experience in the app. We use local and
        Firebase storage to sync your data and enable cross-device access. We may use anonymous analytics
        to improve the app's performance.
      </p>

      <h2>Data Sharing</h2>
      <p>
        We do not sell or share your data with third parties. Your information is only used within the app.
      </p>

      <h2>Security</h2>
      <p>
        We use secure methods to store and sync data between devices. Firebase provides infrastructure
        security and encryption.
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy occasionally. You will be notified of any significant changes
        through the app or website.
      </p>

      <h2>Contact</h2>
      <p>
        If you have any questions or concerns, contact us at <a href="mailto:support@win-the-day.com">support@win-the-day.com</a>.
      </p>
    </div>
  );
}
