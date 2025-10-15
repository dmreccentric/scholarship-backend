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
      to: "eccentricecc481@gmail.com",
      subject: `Enquiry about ${scholarship}`,
      text: `
Name: ${name}
Email: ${email}
Scholarship: ${scholarship}

Message:
${message}
      `,
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
};
