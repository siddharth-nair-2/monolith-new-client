import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const toc = [
  { id: "introduction", label: "Introduction" },
  { id: "scope", label: "Who This Policy Applies To" },
  { id: "controller", label: "Data Controller Information" },
  { id: "data-collected", label: "Information We Collect" },
  { id: "use-of-data", label: "How We Use Your Data" },
  { id: "lawful-bases", label: "Lawful Bases for Processing" },
  { id: "data-sharing", label: "Data Sharing & Subprocessors" },
  { id: "transfers", label: "International Data Transfers" },
  { id: "retention", label: "Data Retention" },
  { id: "cookies", label: "Cookies & Analytics" },
  { id: "your-rights", label: "Your Rights Under GDPR" },
  { id: "security", label: "Data Security" },
  { id: "changes", label: "Changes to this Privacy Policy" },
  { id: "contact", label: "Contact Us" },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-dvh">
      <Header />

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 md:p-12">
            <h1 className="text-5xl md:text-6xl font-serif text-custom-dark-green mb-4 leading-tight">
              Privacy Policy
            </h1>
            <p className="text-sm text-gray-500 mb-12">
              Last updated:{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>

            {/* Table of Contents */}
            <div className="mb-12 bg-gray-50 rounded-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-serif text-custom-dark-green mb-6">
                Table of Contents
              </h2>
              <ul className="grid md:grid-cols-2 gap-2">
                {toc.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="hover:text-[#A3BC02] text-custom-dark-green underline-offset-2 underline focus:text-custom-dark-green focus:underline transition-all duration-150 ease-in-out text-sm font-medium"
                    >
                      {section.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="prose prose-lg max-w-none space-y-10">
              {/* 1. Introduction */}
              <section>
                <h2
                  id="introduction"
                  className="scroll-mt-24 text-3xl font-serif text-custom-dark-green mb-4"
                >
                  1. Introduction
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Welcome to Monolith ("Monolith", "we", "our", or "us"). This
                  Privacy Policy explains how we collect, use, store, and
                  protect personal data when you or your organization use our
                  website at www.monolith.life and our cloud-based SaaS platform
                  and related services ("Service"). By using the Service, you
                  agree to this Privacy Policy. If you do not agree, please do
                  not use our Service.
                </p>
              </section>

              {/* 2. Who This Policy Applies To */}
              <section>
                <h2
                  id="scope"
                  className="scroll-mt-24 text-3xl font-serif text-custom-dark-green mb-4"
                >
                  2. Who This Policy Applies To
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  This Privacy Policy applies to business representatives,
                  administrators, and users who access or use the Service on
                  behalf of a company or other organization. The Service is not
                  intended for individual consumers or children under 18.
                </p>
              </section>

              {/* 3. Data Controller */}
              <section>
                <h2
                  id="controller"
                  className="scroll-mt-24 text-3xl font-serif text-custom-dark-green mb-4"
                >
                  3. Data Controller Information
                </h2>
                <div className="text-gray-700 leading-relaxed">
                  <p>
                    Monolith Inc.
                    <br />
                    Email:{" "}
                    <a
                      href="mailto:info@monolith.life"
                      className="text-[#A3BC02] hover:underline"
                    >
                      info@monolith.life
                    </a>
                  </p>
                </div>
              </section>

              {/* 4. Data We Collect */}
              <section>
                <h2
                  id="data-collected"
                  className="scroll-mt-24 text-3xl font-serif text-custom-dark-green mb-4"
                >
                  4. Information We Collect
                </h2>
                <ul className="space-y-4 text-gray-700">
                  <li>
                    <strong className="text-custom-dark-green">
                      Account Information:
                    </strong>{" "}
                    Name, business email, company name, role, and login
                    credentials when you register or are invited to the Service.
                  </li>
                  <li>
                    <strong className="text-custom-dark-green">
                      Business Data:
                    </strong>{" "}
                    Documents, files, messages, or other content uploaded,
                    submitted, or generated through the Service ("User
                    Content").
                  </li>
                  <li>
                    <strong className="text-custom-dark-green">
                      Usage Data:
                    </strong>{" "}
                    Information about how you use the Service, including access
                    logs, actions taken, device/browser type, IP address, and
                    general location (country/city).
                  </li>
                  <li>
                    <strong className="text-custom-dark-green">
                      Support & Communications:
                    </strong>{" "}
                    Information you provide when you contact us, request
                    support, or otherwise communicate with us.
                  </li>
                  <li>
                    <strong className="text-custom-dark-green">
                      Cookies & Tracking:
                    </strong>{" "}
                    We use cookies and similar technologies to operate the
                    Service, understand usage, and improve performance. For
                    details, see Section 10.
                  </li>
                </ul>
              </section>

              {/* 5. How We Use Your Data */}
              <section>
                <h2
                  id="use-of-data"
                  className="scroll-mt-24 text-3xl font-serif text-custom-dark-green mb-4"
                >
                  5. How We Use Your Data
                </h2>
                <ul className="space-y-4 text-gray-700">
                  <li>
                    <strong className="text-custom-dark-green">
                      Provide the Service:
                    </strong>{" "}
                    To operate, maintain, and provide all features of the
                    Service to your organization.
                  </li>
                  <li>
                    <strong className="text-custom-dark-green">
                      Account Management:
                    </strong>{" "}
                    To create and manage user accounts, authenticate access, and
                    communicate about your account.
                  </li>
                  <li>
                    <strong className="text-custom-dark-green">
                      Support & Security:
                    </strong>{" "}
                    To respond to requests, prevent fraud or misuse, and ensure
                    the security and integrity of the Service.
                  </li>
                  <li>
                    <strong className="text-custom-dark-green">
                      Product Improvement:
                    </strong>{" "}
                    To analyze usage and improve the Service, including
                    troubleshooting, analytics, and product development.
                  </li>
                  <li>
                    <strong className="text-custom-dark-green">
                      Legal & Compliance:
                    </strong>{" "}
                    To comply with legal obligations, enforce agreements, and
                    protect the rights of Monolith, our users, and others.
                  </li>
                  <li>
                    <strong className="text-custom-dark-green">
                      Marketing:
                    </strong>{" "}
                    To send business communications about new features or
                    updates. You may opt out of non-essential communications at
                    any time.
                  </li>
                </ul>
              </section>

              {/* 6. Lawful Bases for Processing */}
              <section>
                <h2
                  id="lawful-bases"
                  className="scroll-mt-24 text-3xl font-serif text-custom-dark-green mb-4"
                >
                  6. Lawful Bases for Processing
                </h2>
                <ul className="space-y-4 text-gray-700">
                  <li>
                    <strong className="text-custom-dark-green">
                      Performance of Contract:
                    </strong>{" "}
                    Most processing is necessary to provide the Service under
                    our contract with your organization.
                  </li>
                  <li>
                    <strong className="text-custom-dark-green">
                      Legitimate Interests:
                    </strong>{" "}
                    For security, analytics, business operations, and
                    communications relevant to your business use.
                  </li>
                  <li>
                    <strong className="text-custom-dark-green">
                      Legal Obligation:
                    </strong>{" "}
                    Compliance with applicable laws and regulations.
                  </li>
                  <li>
                    <strong className="text-custom-dark-green">Consent:</strong>{" "}
                    Where required (e.g., for certain cookies or marketing), we
                    will obtain your consent.
                  </li>
                </ul>
              </section>

              {/* 7. Data Sharing & Subprocessors */}
              <section>
                <h2
                  id="data-sharing"
                  className="scroll-mt-24 text-3xl font-serif text-custom-dark-green mb-4"
                >
                  7. Data Sharing & Subprocessors
                </h2>
                <ul className="space-y-4 text-gray-700">
                  <li>
                    <strong className="text-custom-dark-green">
                      Service Providers:
                    </strong>{" "}
                    We use trusted subprocessors to host, process, or support
                    the Service (e.g., cloud providers, analytics, email). All
                    subprocessors are contractually bound to protect your data
                    under GDPR terms.
                  </li>
                  <li>
                    <strong className="text-custom-dark-green">
                      Legal Requests:
                    </strong>{" "}
                    We may disclose data if required by law, regulation, or
                    valid legal process.
                  </li>
                  <li>
                    <strong className="text-custom-dark-green">
                      Business Transfers:
                    </strong>{" "}
                    In the event of a merger, acquisition, or sale of assets, we
                    may transfer data as part of the transaction. You will be
                    notified of any change in control or data use.
                  </li>
                  <li>
                    <strong className="text-custom-dark-green">
                      No Sale of Personal Data:
                    </strong>{" "}
                    We do not sell personal data to third parties.
                  </li>
                </ul>
              </section>

              {/* 8. International Data Transfers */}
              <section>
                <h2
                  id="transfers"
                  className="scroll-mt-24 text-3xl font-serif text-custom-dark-green mb-4"
                >
                  8. International Data Transfers
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Your data may be processed in the United States, the European
                  Economic Area (EEA), or other countries where our
                  subprocessors operate. Where data is transferred outside the
                  EEA, we use Standard Contractual Clauses or other approved
                  safeguards to ensure adequate protection under GDPR.
                </p>
              </section>

              {/* 9. Data Retention */}
              <section>
                <h2
                  id="retention"
                  className="scroll-mt-24 text-3xl font-serif text-custom-dark-green mb-4"
                >
                  9. Data Retention
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We retain your data as long as necessary to provide the
                  Service and for legitimate business purposes (such as legal
                  compliance, dispute resolution, and enforcing our agreements).
                  Account data and User Content are deleted upon request by your
                  organization or upon termination, subject to legal
                  requirements.
                </p>
              </section>

              {/* 10. Cookies & Analytics */}
              <section>
                <h2
                  id="cookies"
                  className="scroll-mt-24 text-3xl font-serif text-custom-dark-green mb-4"
                >
                  10. Cookies & Analytics
                </h2>
                <ul className="space-y-4 text-gray-700">
                  <li>
                    <strong className="text-custom-dark-green">
                      Essential Cookies:
                    </strong>{" "}
                    Required for site functionality and security.
                  </li>
                  <li>
                    <strong className="text-custom-dark-green">
                      Analytics Cookies:
                    </strong>{" "}
                    Used to measure usage and improve the Service. You may opt
                    out of analytics cookies via your browser settings or our
                    cookie banner (where applicable).
                  </li>
                  <li>
                    <strong className="text-custom-dark-green">
                      Third-Party Tools:
                    </strong>{" "}
                    We may use third-party analytics or service tools, which
                    process data on our behalf and do not use your information
                    for their own purposes.
                  </li>
                </ul>
              </section>

              {/* 11. Your Rights Under GDPR */}
              <section>
                <h2
                  id="your-rights"
                  className="scroll-mt-24 text-3xl font-serif text-custom-dark-green mb-4"
                >
                  11. Your Rights Under GDPR
                </h2>
                <ul className="space-y-4 text-gray-700">
                  <li>
                    <strong className="text-custom-dark-green">Access:</strong>{" "}
                    You may request access to your personal data.
                  </li>
                  <li>
                    <strong className="text-custom-dark-green">
                      Rectification:
                    </strong>{" "}
                    You may correct inaccurate or incomplete data.
                  </li>
                  <li>
                    <strong className="text-custom-dark-green">Erasure:</strong>{" "}
                    You may request deletion of your data in certain
                    circumstances.
                  </li>
                  <li>
                    <strong className="text-custom-dark-green">
                      Restriction:
                    </strong>{" "}
                    You may restrict processing in certain cases.
                  </li>
                  <li>
                    <strong className="text-custom-dark-green">
                      Portability:
                    </strong>{" "}
                    You may request to receive your data in a portable format.
                  </li>
                  <li>
                    <strong className="text-custom-dark-green">
                      Objection:
                    </strong>{" "}
                    You may object to processing where we rely on legitimate
                    interests.
                  </li>
                  <li>
                    <strong className="text-custom-dark-green">
                      Withdraw Consent:
                    </strong>{" "}
                    Where processing is based on consent, you may withdraw
                    consent at any time.
                  </li>
                  <li>
                    <strong className="text-custom-dark-green">
                      To exercise these rights, contact us at
                    </strong>{" "}
                    <a
                      href="mailto:info@monolith.life"
                      className="text-[#A3BC02] hover:underline"
                    >
                      info@monolith.life
                    </a>
                    .
                  </li>
                  <li>
                    <strong className="text-custom-dark-green">
                      Supervisory Authority:
                    </strong>{" "}
                    You also have the right to lodge a complaint with your local
                    data protection authority.
                  </li>
                </ul>
              </section>

              {/* 12. Security Measures */}
              <section>
                <h2
                  id="security"
                  className="scroll-mt-24 text-3xl font-serif text-custom-dark-green mb-4"
                >
                  12. Data Security
                </h2>
                <ul className="space-y-4 text-gray-700">
                  <li>
                    We implement appropriate technical and organizational
                    measures to protect your personal data and User Content,
                    including encryption, access controls, secure hosting, and
                    regular security reviews.
                  </li>
                  <li>
                    While we strive to protect your data, no method of
                    transmission or storage is 100% secure.
                  </li>
                </ul>
              </section>

              {/* 13. Changes to this Policy */}
              <section>
                <h2
                  id="changes"
                  className="scroll-mt-24 text-3xl font-serif text-custom-dark-green mb-4"
                >
                  13. Changes to this Privacy Policy
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will
                  notify you of material changes via email or through the
                  Service. Continued use of the Service after changes take
                  effect constitutes acceptance of the new policy.
                </p>
              </section>

              {/* 14. Contact */}
              <section>
                <h2
                  id="contact"
                  className="scroll-mt-24 text-3xl font-serif text-custom-dark-green mb-4"
                >
                  14. Contact Us
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  For questions or requests regarding your personal data or this
                  Privacy Policy, please contact us at{" "}
                  <a
                    href="mailto:info@monolith.life"
                    className="text-[#A3BC02] hover:underline"
                  >
                    info@monolith.life
                  </a>
                  .
                </p>
              </section>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Monolith Inc. All rights
              reserved.
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
