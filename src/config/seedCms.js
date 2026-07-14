import { CMSModel } from "../models/index.js";

export const seedCMSPages = async () => {
  try {
    const requiredPages = [
      {
        identifier: "TEAMS_OF_SERVICES",
        title: "Terms of Service",
        content: `
          <h3>1. Acceptance of Terms</h3>
          <p>By accessing or using the services provided by Siva Crackers, you agree to comply with and be bound by these Terms of Service. Please review them carefully.</p>
          
          <h3>2. Safety and Usage Guidelines</h3>
          <p>All fireworks and crackers purchased must be handled in accordance with local laws and safety protocols. Siva Crackers is not liable for any injuries, damages, or legal infractions arising from improper handling or unauthorized usage of the items.</p>
          
          <h3>3. Age Restrictions</h3>
          <p>By purchasing from Siva Crackers, you warrant that you are at least 18 years of age or have legal guardian consent, and are purchasing items permitted in your jurisdiction.</p>
          
          <h3>4. Orders and Availability</h3>
          <p>Product availability is subject to seasonal changes and stock levels. We reserve the right to cancel or amend orders in case of stock discrepancies or safety guidelines compliance.</p>
        `,
      },
      {
        identifier: "PRIVACY_POLICY",
        title: "Privacy Policy",
        content: `
          <h3>1. Information Collection</h3>
          <p>We collect personal information such as your name, delivery address, phone number, and email when you place an order. This information is required to fulfill deliveries safely.</p>
          
          <h3>2. Data Protection</h3>
          <p>Your personal data is encrypted and kept secure. We do not sell or lease your database info to third-party marketing companies.</p>
          
          <h3>3. Cookies and Analytics</h3>
          <p>We use session cookies to maintain your shopping cart status and store login tokens for profile retrieval.</p>
        `,
      },
      {
        identifier: "REFUND_POLICY",
        title: "Refund Policy",
        content: `
          <h3>1. Return Guidelines</h3>
          <p>Due to the hazardous and sensitive nature of seasonal fireworks, we generally do not accept return shipping of goods once they are delivered.</p>
          
          <h3>2. Damaged or Defective Items</h3>
          <p>If you receive items that are physically damaged or non-functional, please report this to our support team within 24 hours of delivery. We will verify and process a refund or credit note.</p>
          
          <h3>3. Cancellation Timeline</h3>
          <p>Orders can only be cancelled before they leave our Sivakasi shipping hub. Once dispatched, cancellation is not possible.</p>
        `,
      },
      {
        identifier: "SHIPPING_POLICY",
        title: "Shipping Policy",
        content: `
          <h3>1. Sivakasi Direct Shipping</h3>
          <p>All crackers are packed and dispatched directly from our premium Sivakasi hubs to ensure the highest standards of safety and freshness.</p>
          
          <h3>2. Delivery Timeline</h3>
          <p>Standard delivery to major towns and cities takes between 3 to 7 working days. During peak festival seasons, transit times might vary due to carrier constraints.</p>
          
          <h3>3. Packaging Security</h3>
          <p>We pack items in certified double cardboard boxes to prevent moisture absorption and friction-based hazards during transit.</p>
        `,
      },
    ];

    for (const page of requiredPages) {
      const exists = await CMSModel.findOne({ identifier: page.identifier });
      if (!exists) {
        await CMSModel.create(page);
        console.log(`🌱 Seeded CMS Page: ${page.title} (${page.identifier})`);
      }
    }
  } catch (error) {
    console.error("❌ Failed to seed CMS pages:", error);
  }
};
