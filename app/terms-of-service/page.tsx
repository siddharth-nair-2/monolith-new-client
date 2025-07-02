import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import Link from "next/link";

const toc = [
  { id: "introduction", label: "Introduction" },
  { id: "eligibility", label: "Who May Use the Service" },
  { id: "service-description", label: "Service Description" },
  { id: "account", label: "Account Registration & Security" },
  { id: "user-content", label: "User Content & Data Protection" },
  { id: "privacy", label: "Data Security & Privacy" },
  { id: "acceptable-use", label: "Acceptable Use" },
  { id: "ip", label: "Intellectual Property" },
  { id: "third-party", label: "Third-Party Services" },
  { id: "availability", label: "Service Availability & Changes" },
  { id: "fees", label: "Fees & Payment" },
  { id: "warranty", label: "Disclaimer of Warranties" },
  { id: "liability", label: "Limitation of Liability" },
  { id: "indemnification", label: "Indemnification" },
  { id: "termination", label: "Suspension & Termination" },
  { id: "changes", label: "Changes to These Terms" },
  { id: "law", label: "Governing Law & Jurisdiction" },
  { id: "contact", label: "Contact Us" },
];

export default function TermsOfServicePage() {
  return (
    <div className="min-h-dvh">
      <Header />

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 md:p-12">
            <h1 className="text-5xl md:text-6xl font-serif text-custom-dark-green mb-4 leading-tight">
              Terms of Service
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
                  Welcome to Monolith ("Monolith", "we", "our", or "us"). These
                  Terms of Service ("Terms") govern your access to and use of
                  our website at www.monolith.life, our cloud-based
                  software-as-a-service ("SaaS") platform, and related services
                  ("Service"). Please read these Terms carefully. By accessing
                  or using our Service, you agree to be bound by these Terms and
                  our{" "}
                  <Link
                    href="/privacy-policy"
                    className="text-[#A3BC02] hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  . If you do not agree, you may not use our Service.
                </p>
              </section>

              {/* 2. Who May Use */}
              <section>
                <h2
                  id="eligibility"
                  className="scroll-mt-24 text-3xl font-serif text-custom-dark-green mb-4"
                >
                  2. Who May Use the Service
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  You must be at least 18 years old and have the legal capacity
                  to enter into contracts to use our Service. You may use the
                  Service only in compliance with these Terms and all applicable
                  laws and regulations, including the General Data Protection
                  Regulation (GDPR) if you are located in the European Economic
                  Area ("EEA").
                </p>
              </section>

              {/* 3. Service Description */}
              <section>
                <h2
                  id="service-description"
                  className="scroll-mt-24 text-3xl font-serif text-custom-dark-green mb-4"
                >
                  3. Service Description
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Monolith is a SaaS platform providing an AI-powered knowledge
                  assistant for businesses and organizations. Our Service helps
                  you aggregate, search, and access your organization's
                  information from connected tools and repositories. The Service
                  is subject to change as we continuously improve our features
                  and offerings.
                </p>
              </section>

              {/* 4. Account */}
              <section>
                <h2
                  id="account"
                  className="scroll-mt-24 text-3xl font-serif text-custom-dark-green mb-4"
                >
                  4. Account Registration & Security
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li>
                    You may need to create an account to access certain
                    features. You agree to provide accurate and complete
                    information and keep your account details up to date.
                  </li>
                  <li>
                    You are responsible for maintaining the confidentiality of
                    your account credentials and all activity that occurs under
                    your account.
                  </li>
                  <li>
                    You must notify us immediately at{" "}
                    <a
                      href="mailto:info@monolith.life"
                      className="text-[#A3BC02] hover:underline"
                    >
                      info@monolith.life
                    </a>{" "}
                    if you suspect any unauthorised use or security breach.
                  </li>
                  <li>
                    We may suspend or terminate your account if we believe you
                    have violated these Terms.
                  </li>
                </ul>
              </section>

              {/* 5. User Content */}
              <section>
                <h2
                  id="user-content"
                  className="scroll-mt-24 text-3xl font-serif text-custom-dark-green mb-4"
                >
                  5. User Content & Data Protection
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You may upload, submit, or store data, documents, and other
                  content ("User Content") using our Service. You retain all
                  rights in your User Content.
                </p>
                <ul className="space-y-4 text-gray-700">
                  <li>
                    <strong className="text-custom-dark-green">
                      Data Processing:
                    </strong>{" "}
                    As a processor of your data, we process and safeguard your
                    User Content in compliance with the GDPR and as described in
                    our{" "}
                    <Link
                      href="/privacy-policy"
                      className="text-[#A3BC02] hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </li>
                  <li>
                    <strong className="text-custom-dark-green">
                      Your Responsibility:
                    </strong>{" "}
                    You must ensure you have all necessary rights and lawful
                    basis (including any required consents) to upload User
                    Content and for us to process it as described.
                  </li>
                  <li>
                    <strong className="text-custom-dark-green">License:</strong>{" "}
                    By uploading User Content, you grant us a limited license to
                    use, process, and display your content solely for providing
                    and improving the Service.
                  </li>
                  <li>
                    <strong className="text-custom-dark-green">
                      Prohibited Content:
                    </strong>{" "}
                    You may not upload illegal, infringing, or harmful content,
                    or content you do not have the right to share.
                  </li>
                </ul>
              </section>

              {/* 6. Data Security & Privacy */}
              <section>
                <h2
                  id="privacy"
                  className="scroll-mt-24 text-3xl font-serif text-custom-dark-green mb-4"
                >
                  6. Data Security & Privacy
                </h2>
                <ul className="space-y-4 text-gray-700">
                  <li>
                    We implement appropriate technical and organisational
                    measures to protect your personal data and User Content in
                    accordance with GDPR Article 32.
                  </li>
                  <li>
                    You have the right to access, rectify, erase, restrict, or
                    port your personal data, and to object to certain
                    processing. To exercise these rights, contact us at{" "}
                    <a
                      href="mailto:info@monolith.life"
                      className="text-[#A3BC02] hover:underline"
                    >
                      info@monolith.life
                    </a>
                    .
                  </li>
                  <li>
                    We only process personal data as instructed by you, as the
                    data controller, and as necessary to provide the Service.
                  </li>
                </ul>
              </section>

              {/* 7. Acceptable Use */}
              <section>
                <h2
                  id="acceptable-use"
                  className="scroll-mt-24 text-3xl font-serif text-custom-dark-green mb-4"
                >
                  7. Acceptable Use
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li>
                    Do not use the Service for any unlawful, harmful, or
                    fraudulent purpose.
                  </li>
                  <li>
                    Do not interfere with the security or operation of the
                    Service, or attempt to gain unauthorised access to other
                    accounts or systems.
                  </li>
                  <li>
                    Do not upload or transmit viruses, malware, or malicious
                    code.
                  </li>
                  <li>
                    Do not use the Service to violate the rights (including
                    intellectual property rights) of others.
                  </li>
                  <li>
                    Do not attempt to reverse engineer, decompile, or
                    disassemble any part of the Service.
                  </li>
                </ul>
              </section>

              {/* 8. IP */}
              <section>
                <h2
                  id="ip"
                  className="scroll-mt-24 text-3xl font-serif text-custom-dark-green mb-4"
                >
                  8. Intellectual Property
                </h2>
                <ul className="space-y-4 text-gray-700">
                  <li>
                    All intellectual property rights in the Service (excluding
                    your User Content) are owned by Monolith or our licensors
                    and are protected by applicable law.
                  </li>
                  <li>
                    You may not use our trademarks, branding, or materials
                    without prior written permission.
                  </li>
                  <li>
                    We reserve all rights not expressly granted to you under
                    these Terms.
                  </li>
                </ul>
              </section>

              {/* 9. Third-Party Services */}
              <section>
                <h2
                  id="third-party"
                  className="scroll-mt-24 text-3xl font-serif text-custom-dark-green mb-4"
                >
                  9. Third-Party Services
                </h2>
                <ul className="space-y-4 text-gray-700">
                  <li>
                    Our Service may integrate with or link to third-party
                    services ("Third-Party Services"). We are not responsible
                    for the availability, content, or privacy practices of such
                    services.
                  </li>
                  <li>
                    Use of Third-Party Services is subject to their own terms
                    and policies.
                  </li>
                </ul>
              </section>

              {/* 10. Availability */}
              <section>
                <h2
                  id="availability"
                  className="scroll-mt-24 text-3xl font-serif text-custom-dark-green mb-4"
                >
                  10. Service Availability & Changes
                </h2>
                <ul className="space-y-4 text-gray-700">
                  <li>
                    We aim to provide reliable Service, but do not guarantee it
                    will always be available, uninterrupted, or error-free.
                  </li>
                  <li>
                    We may modify, suspend, or discontinue any aspect of the
                    Service at any time. We will endeavour to notify users of
                    major changes.
                  </li>
                </ul>
              </section>

              {/* 11. Fees & Payment */}
              <section>
                <h2
                  id="fees"
                  className="scroll-mt-24 text-3xl font-serif text-custom-dark-green mb-4"
                >
                  11. Fees & Payment
                </h2>
                <ul className="space-y-4 text-gray-700">
                  <li>
                    If you purchase paid features or subscriptions, you agree to
                    pay all applicable fees as described at the time of
                    purchase.
                  </li>
                  <li>All fees are non-refundable unless required by law.</li>
                  <li>
                    We reserve the right to change our prices. We will notify
                    users in advance of any price changes.
                  </li>
                </ul>
              </section>

              {/* 12. Disclaimer */}
              <section>
                <h2
                  id="warranty"
                  className="scroll-mt-24 text-3xl font-serif text-custom-dark-green mb-4"
                >
                  12. Disclaimer of Warranties
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  The Service is provided "as is" and "as available". We do not
                  warrant that the Service will be error-free or uninterrupted.
                  To the fullest extent permitted by law, we disclaim all
                  warranties, express or implied.
                </p>
              </section>

              {/* 13. Limitation of Liability */}
              <section>
                <h2
                  id="liability"
                  className="scroll-mt-24 text-3xl font-serif text-custom-dark-green mb-4"
                >
                  13. Limitation of Liability
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  To the maximum extent permitted by law, Monolith and its
                  affiliates are not liable for indirect, incidental, special,
                  consequential, or punitive damages, or any loss of profits or
                  revenues, arising from your use of the Service. Our total
                  liability under these Terms shall not exceed the amount paid
                  by you for the Service during the twelve months preceding the
                  claim.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Nothing in these Terms excludes or limits liability for death
                  or personal injury caused by negligence, or for fraud, or for
                  any other liability which cannot be excluded or limited by
                  applicable law (including GDPR).
                </p>
              </section>

              {/* 14. Indemnification */}
              <section>
                <h2
                  id="indemnification"
                  className="scroll-mt-24 text-3xl font-serif text-custom-dark-green mb-4"
                >
                  14. Indemnification
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  You agree to indemnify and hold harmless Monolith and its
                  affiliates from any claims, damages, or expenses arising from
                  your breach of these Terms or misuse of the Service.
                </p>
              </section>

              {/* 15. Suspension & Termination */}
              <section>
                <h2
                  id="termination"
                  className="scroll-mt-24 text-3xl font-serif text-custom-dark-green mb-4"
                >
                  15. Suspension & Termination
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may suspend or terminate your access to the Service at any
                  time if you violate these Terms, applicable law, or if
                  required to by law or competent authority. You may terminate
                  your account at any time by contacting us.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Upon termination, your right to use the Service will cease,
                  but sections intended to survive (including confidentiality,
                  intellectual property, and limitations of liability) will
                  continue to apply.
                </p>
              </section>

              {/* 16. Changes */}
              <section>
                <h2
                  id="changes"
                  className="scroll-mt-24 text-3xl font-serif text-custom-dark-green mb-4"
                >
                  16. Changes to These Terms
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update these Terms from time to time. We will notify
                  users of material changes via email or by posting a notice on
                  our website. Continued use of the Service after changes take
                  effect constitutes acceptance of the new Terms.
                </p>
              </section>

              {/* 17. Law & Jurisdiction */}
              <section>
                <h2
                  id="law"
                  className="scroll-mt-24 text-3xl font-serif text-custom-dark-green mb-4"
                >
                  17. Governing Law & Jurisdiction
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  These Terms are governed by the laws of the United States and
                  applicable state laws, unless otherwise required by mandatory
                  law in your country of residence. Any disputes will be subject
                  to the jurisdiction of the courts in your country of residence
                  where applicable.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  The Service is intended primarily for use by businesses and
                  organizations. If you are an individual consumer, additional
                  consumer protection laws may apply.
                </p>
              </section>

              {/* 18. Contact */}
              <section>
                <h2
                  id="contact"
                  className="scroll-mt-24 text-3xl font-serif text-custom-dark-green mb-4"
                >
                  18. Contact Us
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  For any questions about these Terms or your rights, please
                  contact us at{" "}
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
