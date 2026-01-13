
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import nodemailer from "npm:nodemailer@6.9.7"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
    type: 'welcome' | 'admin_notification' | 'new_lead';
    payload: any;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { type, payload } = await req.json() as EmailRequest

        // Check secrets
        const smtpPassword = Deno.env.get("SMTP_PASSWORD")
        if (!smtpPassword) {
            throw new Error("SMTP_PASSWORD no está configurado en los secretos de Supabase")
        }

        const transporter = nodemailer.createTransport({
            host: "smtpout.secureserver.net",
            port: 465,
            secure: true,
            auth: {
                user: "info@678fit.com",
                pass: smtpPassword,
            },
        })

        let mailOptions = {
            from: '"678FIT Team" <info@678fit.com>',
            to: "",
            subject: "",
            html: "",
        }

        if (type === 'welcome') {
            const { name, email, qrCode } = payload
            if (!email) throw new Error("Falta el email del destinatario")

            mailOptions.to = email
            mailOptions.subject = '¡Bienvenido a 678FIT!'
            mailOptions.html = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #d4af37; text-align: center;">¡Bienvenido a 678FIT!</h2>
          <p>Hola <strong>${name}</strong>,</p>
          <p>Tu inscripción ha sido procesada exitosamente. Estamos felices de que te unas a nosotros.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #555;">Tu código de miembro:</p>
            <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #000;">${qrCode}</p>
          </div>

          <p>Si tienes alguna duda, puedes responder a este correo.</p>
          <p style="text-align: center; margin-top: 30px;">
            <strong>678FIT</strong><br>
            <span style="font-size: 12px; color: #888;">Tu mejor versión comienza aquí.</span>
          </p>
        </div>
      `
        } else if (type === 'admin_notification') {
            const { newMemberName, plan, email, phone } = payload

            mailOptions.to = "info@678fit.com"
            mailOptions.subject = `🔔 Nueva Inscripción: ${newMemberName}`
            mailOptions.html = `
            <div style="font-family: sans-serif;">
                <h2>Nueva Inscripción Recibida</h2>
                <ul>
                    <li><strong>Nombre:</strong> ${newMemberName}</li>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Teléfono:</strong> ${phone}</li>
                    <li><strong>Plan:</strong> ${plan}</li>
                </ul>
            </div>
        `
        } else if (type === 'new_lead') {
            const { name, phone, goal } = payload

            mailOptions.to = "info@678fit.com"
            mailOptions.subject = `🔥 Nuevo Lead: ${name}`
            mailOptions.html = `
            <div style="font-family: sans-serif;">
                <h2>Nueva Solicitud de Clase Gratis</h2>
                <ul>
                    <li><strong>Nombre:</strong> ${name}</li>
                    <li><strong>Teléfono:</strong> ${phone}</li>
                    <li><strong>Objetivo:</strong> ${goal}</li>
                </ul>
                <p>Contactar lo antes posible para agendar.</p>
            </div>
        `
        } else {
            throw new Error('Tipo de notificación no válido')
        }

        console.log(`Enviando email tipo ${type} a ${mailOptions.to}`)

        // Send email
        const info = await transporter.sendMail(mailOptions)
        console.log("Message sent: %s", info.messageId);

        return new Response(
            JSON.stringify({ message: 'Email enviado correctamente', id: info.messageId }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        console.error("Error sending email:", error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
