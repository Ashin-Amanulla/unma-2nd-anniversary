import { sendEmail } from '../utils/email.js';
import { logger } from '../utils/logger.js';

// Submit document request
const submitDocumentRequest = async (req, res) => {
    try {
        const { name, email, contact, jnvSchool, message, documentType } = req.body;

        // Validate required fields
        if (!name || !email || !contact || !message) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, contact, and message are required',
            });
        }

        // Create email content
        const emailHtml = `
            <h2>Document Request</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Contact:</strong> ${contact}</p>
            ${jnvSchool ? `<p><strong>JNV School:</strong> ${jnvSchool}</p>` : ''}
            ${documentType ? `<p><strong>Document Requested:</strong> ${documentType}</p>` : ''}
            <p><strong>Message/Purpose:</strong></p>
            <p>${message}</p>
            <hr>
            <p><small>This request was submitted from the UNMA website.</small></p>
        `;

        // Send email to info@unma.in
        await sendEmail({
            to: 'info@unma.in',
            subject: `Document Request from ${name}`,
            html: emailHtml,
        });

        logger.info(`Document request submitted by ${name} (${email})`);

        res.json({
            success: true,
            message: 'Document request submitted successfully. We will contact you soon.',
        });
    } catch (error) {
        logger.error('Error submitting document request:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting document request',
            error: error.message,
        });
    }
};

export { submitDocumentRequest };
