import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.90.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SendImageRequest {
  recipientNumber: string;
  imageUrl?: string;
  imageBase64?: string;
  caption?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("is_admin, is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (adminError || !adminUser || !adminUser.is_admin || !adminUser.is_active) {
      return new Response(
        JSON.stringify({ error: "Access denied. Admin privileges required." }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Hardcoded WhatsApp API credentials
    const adminConfig = {
      api_key: "GcCqTlEjxghF7MHtaxCwBeN1NX3ud7",
      sender_number: "601116366799"
    };

    const body: SendImageRequest = await req.json();
    const { recipientNumber, imageUrl, imageBase64, caption = "" } = body;

    if (!recipientNumber) {
      return new Response(
        JSON.stringify({ error: "Recipient number is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let uploadedImageUrl = imageUrl;

    if (!uploadedImageUrl && imageBase64) {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

      const formData = new FormData();
      const blob = new Blob([imageBuffer], { type: "image/jpeg" });
      formData.append("file", blob, "image.jpg");

      const uploadResponse = await fetch("https://tmpfiles.org/api/v1/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image to tmpfiles.org");
      }

      const uploadResult = await uploadResponse.json();

      if (uploadResult.status === "success" && uploadResult.data?.url) {
        uploadedImageUrl = uploadResult.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/");
      } else {
        throw new Error("Invalid response from tmpfiles.org");
      }
    }

    if (uploadedImageUrl && uploadedImageUrl.startsWith('http')) {
      if (!uploadedImageUrl.includes('tmpfiles.org/dl/') && uploadedImageUrl.includes('tmpfiles.org/')) {
        uploadedImageUrl = uploadedImageUrl.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
      }
    }

    if (!uploadedImageUrl) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const whatsappPayload = {
      api_key: adminConfig.api_key,
      sender: adminConfig.sender_number,
      number: recipientNumber,
      media_type: "image",
      caption: caption,
      url: uploadedImageUrl,
    };

    const whatsappResponse = await fetch("https://ustazai.my/send-media", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(whatsappPayload),
    });

    const whatsappResult = await whatsappResponse.json();

    const logEntry = {
      admin_id: user.id,
      recipient_number: recipientNumber,
      image_url: uploadedImageUrl,
      caption: caption,
      status: whatsappResponse.ok ? "success" : "failed",
      error_message: whatsappResponse.ok ? null : JSON.stringify(whatsappResult),
    };

    await supabase.from("whatsapp_sent_messages").insert(logEntry);

    if (!whatsappResponse.ok) {
      return new Response(
        JSON.stringify({
          error: "Failed to send WhatsApp message",
          details: whatsappResult
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Image sent successfully",
        imageUrl: uploadedImageUrl,
        result: whatsappResult
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
