const fs = require("fs");
const path = require("path");

const axios = require("axios");
const last = require("lodash/last");
const pipedrive = require("pipedrive");

const getLeadCustomFields = require("./utils/getLeadCustomFields.js");
const saveUserConsentInGoogleSpreadsheet = require("./utils/saveUserConsentInGoogleSpreadsheet.js");

const isPolishVersion = process.env.PUBLIC_PATH === "https://selleo.pl";

const addLeadToPipedrive = async (payload) => {
  const { name, email, subject, attachment } = payload?.data;

  const defaultSubject = `${isPolishVersion ? "Selleo.pl" : "Selleo.com"} enquiry from ${name}`;

  const defaultClient = new pipedrive.ApiClient();
  defaultClient.authentications.api_key.apiKey = process.env.PIPEDRIVE_API_KEY;

  try {
    const personsApi = new pipedrive.PersonsApi(defaultClient);
    const leadsApi = new pipedrive.LeadsApi(defaultClient);
    const filesApi = new pipedrive.FilesApi(defaultClient);

    const searchOptions = {
      fields: "email",
      exactMatch: true
    };

    const searchPersonsResponse = await personsApi.searchPersons(email, searchOptions);

    const items = searchPersonsResponse?.data?.items;
    const personItem = items?.[0]?.item;

    let personIdToSend = personItem?.id;

    if (!personIdToSend) {
      const createPersonOptions = pipedrive.NewPerson.constructFromObject(undefined, {
        name,
        email
      });

      const newPersonResponse = await personsApi.addPerson(createPersonOptions);

      const newPersonId = newPersonResponse?.data?.id;
      personIdToSend = newPersonId;
    }

    const newLeadCustomFields = getLeadCustomFields(payload.data);

    const createLeadData = {
      ...newLeadCustomFields,
      title: subject || defaultSubject
    };

    const createLeadOptions = pipedrive.AddLeadRequest.constructFromObject({
      personId: personIdToSend,
      ...createLeadData
    });

    const addLeadResponse = await leadsApi.addLead(createLeadOptions);

    const newLeadConsoleMessage = addLeadResponse.success ? "Successfully added new lead" : "Error adding new lead";

    console.info(newLeadConsoleMessage);

    if (attachment?.url && addLeadResponse?.data?.id) {
      const fileExtension = last(attachment?.url.split("."));

      try {
        const response = await axios.get(attachment?.url, { responseType: "stream" });

        const filePath = path.join(`/tmp/attachedFile.${fileExtension}`);
        const writer = fs.createWriteStream(filePath);

        response.data.pipe(writer);

        writer.on("finish", async () => {
          writer.close();

          const addFileResponse = await filesApi.addFile(filePath, {
            leadId: addLeadResponse?.data?.id
          });

          const attachmentConsoleMessage = addFileResponse.success
            ? "Successfully added file to new lead"
            : "Error adding file to new lead";

          console.info(attachmentConsoleMessage);
        });
      } catch (err) {
        throw new Error(`Error downloading and saving file: ${JSON.stringify(err)}`);
      }
    }
  } catch (err) {
    console.error(`Error adding new lead to Pipedrive: ${JSON.stringify(err)}`);
  }
};

exports.handler = async (event) => {
  const eventBody = JSON.parse(event?.body);
  const { created_at, data, email, name } = eventBody.payload;
  const { marketingConsentMatter, message, newsletter, newsletterConsentMatter, recaptchaScore } = data || {};

  const score = Number(recaptchaScore);

  const isValidRecaptcha = Number.isFinite(score) && score >= 0.8;
  const isValidMessage = typeof message === "string" && message.trim().length;

  if (!isValidRecaptcha || !isValidMessage) {
    console.info(`Spam message blocked due to invalid input: \nMessage: ${message}\nRecaptcha score: ${recaptchaScore}`);

    return {
      statusCode: 422
    };
  }

  console.info(`Contact form data: \nName: ${name}\nEmail: ${email}\nNewsletter: ${newsletter}`);

  await addLeadToPipedrive(eventBody.payload);

  if (process.env.PUBLIC_PATH === "https://selleo.com") {
    const url = "https://api.getresponse.com/v3/contacts";

    const data = {
      name: name,
      campaign: { campaignId: "M2BpO" },
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
        created_at,
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
