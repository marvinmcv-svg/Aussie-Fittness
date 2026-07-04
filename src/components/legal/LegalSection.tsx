'use client';

import { useState } from 'react';
import { FileText, ScrollText, RotateCcw } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';

export function LegalSection() {
  const [openDoc, setOpenDoc] = useState<'terms' | 'privacy' | 'refund' | null>(null);

  return (
    <div className="space-y-2">
      <h3 className="px-1 text-sm font-semibold text-muted-foreground">Legal</h3>
      <LegalLink
        icon={<ScrollText className="h-4 w-4" />}
        label="Terms of Service"
        onClick={() => setOpenDoc('terms')}
      />
      <LegalLink
        icon={<FileText className="h-4 w-4" />}
        label="Privacy Policy"
        onClick={() => setOpenDoc('privacy')}
      />
      <LegalLink
        icon={<RotateCcw className="h-4 w-4" />}
        label="Refund Policy"
        onClick={() => setOpenDoc('refund')}
      />

      {openDoc && (
        <Dialog open onOpenChange={(o) => { if (!o) setOpenDoc(null); }}>
          <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto custom-scroll">
            <DialogHeader>
              <DialogTitle>
                {openDoc === 'terms' && 'Terms of Service'}
                {openDoc === 'privacy' && 'Privacy Policy'}
                {openDoc === 'refund' && 'Refund Policy'}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Legal document — please read carefully.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              {openDoc === 'terms' && <TermsOfService />}
              {openDoc === 'privacy' && <PrivacyPolicy />}
              {openDoc === 'refund' && <RefundPolicy />}
            </div>
            <p className="border-t border-border pt-4 text-xs text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function LegalLink({
  icon, label, onClick,
}: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </div>
      <span className="flex-1 text-sm font-medium">{label}</span>
    </button>
  );
}

function TermsOfService() {
  return (
    <>
      <h4 className="font-semibold text-foreground">1. Acceptance of Terms</h4>
      <p>By accessing or using the Aussie Fitness Cookbook app ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>

      <h4 className="font-semibold text-foreground">2. Description of Service</h4>
      <p>The Service provides access to a collection of high-protein recipes, meal planning tools, and shopping list management. Some features require a premium subscription.</p>

      <h4 className="font-semibold text-foreground">3. Premium Subscription</h4>
      <p>Premium access is granted as a one-time payment of $9.99 AUD. This grants lifetime access to all premium recipes and features. Premium status is tied to your account and is non-transferable.</p>

      <h4 className="font-semibold text-foreground">4. User Accounts</h4>
      <p>You are responsible for maintaining the security of your account and password. You must be at least 13 years old to create an account. You agree not to share your account credentials with others.</p>

      <h4 className="font-semibold text-foreground">5. User Content</h4>
      <p>You retain ownership of any data you create (favorites, meal plans, shopping lists). You grant us a license to store and display this data solely for the purpose of providing the Service to you.</p>

      <h4 className="font-semibold text-foreground">6. Recipe Information</h4>
      <p>Nutritional information is provided as an estimate only. We are not responsible for any health issues arising from the use of our recipes. Always consult a healthcare professional before making significant dietary changes.</p>

      <h4 className="font-semibold text-foreground">7. Prohibited Conduct</h4>
      <p>You agree not to: (a) attempt to bypass premium restrictions, (b) use automated tools to scrape content, (c) share account credentials, (d) use the Service for any unlawful purpose.</p>

      <h4 className="font-semibold text-foreground">8. Termination</h4>
      <p>We reserve the right to terminate or suspend accounts that violate these Terms. Upon termination, your data will be deleted in accordance with our Privacy Policy.</p>

      <h4 className="font-semibold text-foreground">9. Changes to Terms</h4>
      <p>We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>

      <h4 className="font-semibold text-foreground">10. Contact</h4>
      <p>For questions about these Terms, contact: support@aussiefit.com</p>
    </>
  );
}

function PrivacyPolicy() {
  return (
    <>
      <h4 className="font-semibold text-foreground">1. Information We Collect</h4>
      <p><strong>Account data:</strong> Email address, name (optional), and password (hashed).</p>
      <p><strong>User data:</strong> Favorites, meal plans, shopping lists, and daily macro goals.</p>
      <p><strong>Usage data:</strong> We do not currently use analytics or tracking tools.</p>

      <h4 className="font-semibold text-foreground">2. How We Use Your Data</h4>
      <p>We use your data to: (a) provide the Service, (b) sync your data across devices, (c) process payments via Stripe, (d) send password reset emails when requested.</p>

      <h4 className="font-semibold text-foreground">3. Data Storage</h4>
      <p>Your data is stored in a secure database. Passwords are hashed using bcrypt. Payment information is processed by Stripe — we never store your credit card details.</p>

      <h4 className="font-semibold text-foreground">4. Data Sharing</h4>
      <p>We do not sell or share your data with third parties, except: (a) Stripe for payment processing, (b) Resend for transactional emails, (c) as required by law.</p>

      <h4 className="font-semibold text-foreground">5. Data Retention</h4>
      <p>Your data is retained for as long as your account is active. If you delete your account, all associated data (favorites, meal plans, shopping lists) is permanently deleted.</p>

      <h4 className="font-semibold text-foreground">6. Your Rights</h4>
      <p>You have the right to: (a) access your data, (b) correct inaccurate data, (c) request deletion of your account and data, (d) export your data. Contact support@aussiefit.com to exercise these rights.</p>

      <h4 className="font-semibold text-foreground">7. Cookies</h4>
      <p>We use essential cookies for authentication (login session). We do not use advertising or tracking cookies.</p>

      <h4 className="font-semibold text-foreground">8. Security</h4>
      <p>We implement security measures including HTTPS, bcrypt password hashing, rate limiting, and input validation. However, no method of transmission over the internet is 100% secure.</p>

      <h4 className="font-semibold text-foreground">9. Children&apos;s Privacy</h4>
      <p>The Service is not directed to children under 13. We do not knowingly collect data from children under 13.</p>

      <h4 className="font-semibold text-foreground">10. Changes to This Policy</h4>
      <p>We may update this Privacy Policy from time to time. We will notify users of significant changes via email.</p>

      <h4 className="font-semibold text-foreground">11. Contact</h4>
      <p>For privacy questions or requests, contact: support@aussiefit.com</p>
    </>
  );
}

function RefundPolicy() {
  return (
    <>
      <h4 className="font-semibold text-foreground">1. One-Time Payment</h4>
      <p>Premium access is a one-time payment of $9.99 AUD for lifetime access to all premium recipes and features.</p>

      <h4 className="font-semibold text-foreground">2. 14-Day Money-Back Guarantee</h4>
      <p>If you are not satisfied with your premium purchase, you may request a full refund within 14 days of the purchase date. No questions asked.</p>

      <h4 className="font-semibold text-foreground">3. How to Request a Refund</h4>
      <p>To request a refund, email support@aussiefit.com with: (a) the email address used for your account, (b) the date of purchase, (c) &quot;Refund Request&quot; in the subject line.</p>

      <h4 className="font-semibold text-foreground">4. Refund Processing</h4>
      <p>Approved refunds are processed back to the original payment method within 5-10 business days. Your premium access will be revoked once the refund is processed.</p>

      <h4 className="font-semibold text-foreground">5. Non-Refundable Cases</h4>
      <p>Refunds will not be issued: (a) after the 14-day guarantee period, (b) for accounts terminated due to Terms of Service violations, (c) for accounts where premium was manually granted by an administrator.</p>

      <h4 className="font-semibold text-foreground">6. Chargebacks</h4>
      <p>If you initiate a chargeback with your bank or credit card company, we reserve the right to suspend your account pending resolution. Please contact us first — we&apos;re happy to help.</p>

      <h4 className="font-semibold text-foreground">7. Contact</h4>
      <p>For refund questions, contact: support@aussiefit.com</p>
    </>
  );
}
