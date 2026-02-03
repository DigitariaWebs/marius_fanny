import * as nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_PORT === '465', // true pour 465, false pour 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Tester la connexion
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Erreur de configuration email:', error);
  } else {
    console.log('✅ Serveur email prêt à envoyer');
  }
});

// Template pour email de vérification
export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationUrl: string,
  verificationCode?: string
): Promise<void> {
  // Use the provided code or generate a mock one
  const code = verificationCode || Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '✨ Confirmez votre email - Marius & Fanny',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F9F7F2; border-radius: 10px;">
          
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #C5A065; font-family: 'Great Vibes', cursive; font-size: 40px; margin: 0;">
              Marius & Fanny
            </h1>
          </div>

          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #2D2A26; text-align: center; margin-bottom: 20px;">
              Bienvenue ${name || 'ami'} ! 👋
            </h2>

            <p style="color: #555; line-height: 1.6; text-align: center; margin-bottom: 30px;">
              Merci de vous être inscrit. Pour activer votre compte et commencer à utiliser nos services, 
              veuillez confirmer votre adresse email en utilisant le code de vérification ci-dessous.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #F9F7F2; padding: 20px; border-radius: 8px; border: 2px solid #C5A065;">
                <p style="color: #999; margin: 0 0 10px 0; font-size: 12px;">Votre code de vérification :</p>
                <p style="color: #C5A065; font-size: 28px; font-weight: bold; letter-spacing: 3px; margin: 0; font-family: monospace;">
                  ${code}
                </p>
              </div>
            </div>

            <p style="color: #999; text-align: center; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              Ce code expire dans <strong>24 heures</strong>.
            </p>

            <p style="color: #999; text-align: center; font-size: 12px; margin-top: 10px;">
              Si vous n'avez pas créé ce compte, ignorez cet email.
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© 2024 Marius & Fanny. Tous droits réservés.</p>
          </div>

        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de vérification envoyé:', info.response);
    return { success: true } as any;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
};

// Template pour email de réinitialisation de mot de passe
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
): Promise<void> {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🔐 Réinitialiser votre mot de passe - Marius & Fanny',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F9F7F2; border-radius: 10px;">
          
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #C5A065; font-family: 'Great Vibes', cursive; font-size: 40px; margin: 0;">
              Marius & Fanny
            </h1>
          </div>

          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #2D2A26; text-align: center; margin-bottom: 20px;">
              Réinitialiser votre mot de passe
            </h2>

            <p style="color: #555; line-height: 1.6; text-align: center; margin-bottom: 30px;">
              Vous avez demandé la réinitialisation de votre mot de passe. 
              Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${url}" 
                 style="display: inline-block; padding: 15px 40px; background-color: #C5A065; color: white; 
                        text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; transition: opacity 0.3s;">
                🔐 Réinitialiser le mot de passe
              </a>
            </div>

            <p style="color: #999; text-align: center; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              Ce lien expire dans <strong>1 heure</strong>.
            </p>

            <p style="color: #999; text-align: center; font-size: 12px; margin-top: 10px;">
              Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
            </p>
          </div>

        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de réinitialisation envoyé:', info.response);
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
};

export default transporter;