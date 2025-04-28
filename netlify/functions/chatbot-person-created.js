const crypto = require("crypto");

const axios = require("axios");

const sendDataToGA = async ({ eventName, eventParams }) => {
  const measurementId = process.env.GA_MEASUREMENT_ID;
  const gaApiKey = process.env.GA_API_KEY;
  const clientId = crypto.randomUUID();

  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${gaApiKey}`;

  const data = {
    client_id: clientId,
    events: [
      {
        name: eventName,
        params: eventParams
      }
    ]
  };

  try {
    const res = await axios.post(url, data, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    console.info(res.status, res.statusText);
  } catch (error) {
    if (error.response) {
      console.error("Error sending data to GA:", error.response.data);
    }

    console.error("Error sending data to GA:", error.message);
  }
};

exports.handler = async (event) => {
  if (process.env.PUBLIC_PATH === "https://selleo.com") {
    const eventBody = JSON.parse(event?.body);
    const { pipedrive_service_name: service } = eventBody.meta;
    const { name, primary_email: email } = eventBody.current;

    console.info(`Pipedrive data: \nName: ${name}\nEmail: ${email}${service ? `\nService: ${service}` : ""}`);

    if (email) {
      const gaEvent = { eventName: "form_submit_chatbot", eventParams: { email: email } };

      await sendDataToGA(gaEvent);
    }

    const url = "https://api.getresponse.com/v3/contacts";

    const data = {
      name: name,
      campaign: { campaignId: "M2BpO" },
      email: email
    };

    const config = {
      headers: {
        "X-Auth-Token": `api-key ${process.env.GR_API_KEY}`,
        "Content-Type": "application/json"
      }
    };

    if (service === "leadbooster-chat") {
      try {
        const res = await axios.post(url, data, config);

        console.info("Successfully added person to GR, status:", res.status, res.statusText);

        return {
          statusCode: res.status
        };
      } catch (err) {
        console.error("Error adding person to GR, status:", err.response.data.httpStatus, err.response.data.message);

        return {
          statusCode: err.response.data.httpStatus
        };
      }
    } else {
      console.error(`422 Unprocessable Entity (Service was expected to be 'leadbooster-chat' instead we received '${service}')`);

      return {
        statusCode: 422
      };
    }
  }
};
