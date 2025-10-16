import nodemailer from "nodemailer";

export const sendEnquiry = async (req, res) => {
  const { name, email, message, scholarship } = req.body;

  if (!name || !email || !message || !scholarship) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "eccentricecc481@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD, // use an App Password, not your Gmail password!
      },
    });

    await transporter.sendMail({
      from: `"Scholarship Enquiry" <${email}>`,
      to: "hibasameera06@gmail.com",
      subject: `Enquiry about ${scholarship}`,
      html: `
  <div style="
    font-family: Arial, sans-serif;
    background-color: #f9fafb;
    padding: 30px;
    color: #333;
  ">
    <div style="
      max-width: 600px;
      margin: auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      overflow: hidden;
    ">
      <div style="
        background-color: #2563eb;
        color: white;
        padding: 18px 24px;
        font-size: 20px;
        font-weight: 600;
      ">
        Scholarship Enquiry
      </div>

      <div style="padding: 24px;">
        <p style="margin-bottom: 16px; font-size: 16px;">
          You have received a new enquiry about <strong>${scholarship}</strong>.
        </p>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="font-weight: bold; padding: 8px 0;">Name:</td>
            <td>${name}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 8px 0;">Email:</td>
            <td><a href="mailto:${email}" style="color: #2563eb;">${email}</a></td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 8px 0;">Scholarship:</td>
            <td>${scholarship}</td>
          </tr>
        </table>

        <div style="
          margin-top: 20px;
          padding: 16px;
          background-color: #f1f5f9;
          border-left: 4px solid #2563eb;
          border-radius: 8px;
        ">
          <p style="margin: 0; font-size: 15px; white-space: pre-line;">${message}</p>
        </div>

        <p style="margin-top: 24px; font-size: 14px; color: #6b7280;">
          This message was sent via the Scholarship Enquiry form on your website.
        </p>
      </div>

      <div style="
        background-color: #f3f4f6;
        padding: 12px 24px;
        text-align: center;
        font-size: 13px;
        color: #9ca3af;
      ">
        © ${new Date().getFullYear()} Scholarship App. All rights reserved.
      </div>
    </div>
  </div>
  `,
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
};
