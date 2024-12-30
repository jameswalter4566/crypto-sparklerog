import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";

const Legal = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <ScrollArea className="h-[calc(100vh-200px)] rounded-md">
        <div className="max-w-4xl mx-auto space-y-8 text-gray-200">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">Privacy Policy</h2>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Introduction</h3>
              <p>Smart Trade Technologies ("Company," "we," "our," or "us") values your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Solana-based meme coin cryptocurrency trading platform ("Platform"). By using our Platform, you consent to the practices described in this Privacy Policy.</p>
              
              <h3 className="text-xl font-semibold">Information We Collect</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Personal Information: When you create an account or interact with our Platform, we may collect personal information such as your name, email address, and wallet address.</li>
                <li>Usage Data: We collect information about your use of the Platform, including transaction history, log data, and device information.</li>
                <li>Cookies and Tracking Technologies: We use cookies and similar technologies to enhance user experience and analyze Platform performance.</li>
              </ul>

              <h3 className="text-xl font-semibold">How We Use Your Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>To provide and maintain the Platform.</li>
                <li>To improve the functionality and performance of the Platform.</li>
                <li>To communicate with you regarding updates, security alerts, and account-related information.</li>
                <li>To comply with legal obligations.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">Terms and Conditions</h2>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Introduction</h3>
              <p>These Terms and Conditions ("Terms") govern your use of the Platform provided by Smart Trade Technologies. By accessing or using our Platform, you agree to be bound by these Terms.</p>

              <h3 className="text-xl font-semibold">Eligibility</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must be at least 18 years old to use our Platform.</li>
                <li>You are responsible for ensuring compliance with all applicable laws in your jurisdiction.</li>
              </ul>

              <h3 className="text-xl font-semibold">Platform Use</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>No Financial Advice: The Platform is for informational and trading purposes only. We do not provide financial, investment, or legal advice.</li>
                <li>Account Security: You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>Prohibited Activities: You agree not to engage in activities that harm the Platform, violate applicable laws, or infringe on the rights of others.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">Risk Disclosures</h2>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">General Risk Statement</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Volatility: Cryptocurrency markets are highly volatile and unpredictable. The value of meme coins can fluctuate significantly.</li>
                <li>Regulatory Risks: Cryptocurrencies may be subject to regulatory scrutiny and restrictions, which can impact their value and your ability to trade.</li>
                <li>Technological Risks: The Platform relies on blockchain technology, which may be subject to vulnerabilities, bugs, or network congestion.</li>
              </ul>

              <h3 className="text-xl font-semibold">Contact Us</h3>
              <p>If you have any questions about these policies, please contact us via the agent chat support in the bottom right.</p>
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Legal;