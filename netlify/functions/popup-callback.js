const axios = require("axios");

const saveUserConsentInGoogleSpreadsheet = require("./utils/saveUserConsentInGoogleSpreadsheet.js");

exports.handler = async (event) => {
  if (process.env.PUBLIC_PATH === "https://selleo.com") {
    const eventBody = JSON.parse(event?.body);
    const { campaignId, email, name, newsletter, newsletterConsentMatter, marketingConsentMatter } = eventBody;

    console.info(`Popup data: \nName: ${name}\nEmail: ${email}\nCampaign ID: ${campaignId}\nNewsletter: ${newsletter}`);

    const url = "https://api.getresponse.com/v3/contacts";
    const data = {
      name: name,
      campaign: { campaignId },
      email: email,
      customFieldValues: [
        {
          customFieldId: "nn1IrJ",
          value: [JSON.parse(newsletter) ? "yes" : "no"]
        }
      ]
    };

    const config = {
      headers: {
        "X-Auth-Token": `api-key ${process.env.GR_API_KEY}`,
        "Content-Type": "application/json"
      }
    };

    try {
      const res = await axios.post(url, data, config);
      console.info(res.status, res.statusText);

      await saveUserConsentInGoogleSpreadsheet({
        created_at: new Date().toISOString(),
        email,
        marketingConsentMatter,
        name,
        newsletter,
        newsletterConsentMatter
      });

      return {
        statusCode: res.status
      };
    } catch (err) {
      console.error(err.response.data.httpStatus, err.response.data.message);

      return {
        statusCode: err.response.data.httpStatus
      };
    }
  }
};
