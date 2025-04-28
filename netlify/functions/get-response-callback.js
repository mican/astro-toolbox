const axios = require("axios");
const pipedrive = require("pipedrive");

const constants = require("./utils/constants.js");

const getNoteEvent = (action) => {
  switch (action) {
    case "open":
      return "Email opened";
    case "click":
      return "Link clicked";
    case "subscribe":
      return "Subscribed to GetResponse";
    case "unsubscribe":
      return "Unsubscribed from GetResponse";
  }
};

exports.handler = async (event) => {
  const data = event?.queryStringParameters;

  const defaultClient = new pipedrive.ApiClient();
  defaultClient.authentications.api_key.apiKey = process.env.PIPEDRIVE_API_KEY;

  const GRBaseUrl = "https://api.getresponse.com/v3/contacts";
  const GRBaseConfig = {
    headers: {
      "X-Auth-Token": `api-key ${process.env.GR_API_KEY}`
    }
  };

  try {
    const personApi = new pipedrive.PersonsApi(defaultClient);
    const dealFieldsApi = new pipedrive.DealFieldsApi(defaultClient);
    const notesApi = new pipedrive.NotesApi(defaultClient);
    const leadsApi = new pipedrive.LeadsApi(defaultClient);

    const searchTerm = data.contact_email;
    const GRContactId = data.CONTACT_ID;
    const searchOptions = {
      fields: "email",
      exactMatch: true
    };

    const searchPersonsResponse = await personApi.searchPersons(searchTerm, searchOptions);
    const GRContact = await axios.get(`${GRBaseUrl}/${GRContactId}`, GRBaseConfig);
    const GRContactEngagementScore = GRContact?.data?.engagementScore;

    const items = searchPersonsResponse?.data?.items;
    const personItem = items?.[0]?.item;
    const personId = personItem?.id;

    const leadsData = await leadsApi.getLeads({ limit: 1000 });
    const personMatchedLead = leadsData.data.find((lead) => lead.person_id === personId);
    const leadId = personMatchedLead?.id;

    if (leadId) {
      const noteEvent = getNoteEvent(data.action);

      const noteEventText = noteEvent ? `${noteEvent}` : undefined;
      const noteSubjectText = data.message_subject ? `subject: ${data.message_subject}` : undefined;

      const date = new Date(Date.now());
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hour = date.getHours();
      const minute = date.getMinutes();
      const second = date.getSeconds();
      const dateString = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

      const noteContent = `${dateString} - ${noteEventText ?? ""}${noteSubjectText ? `, ${noteSubjectText}` : ""}`;

      const allNotes = await notesApi.getNotes({ personId, leadId });
      const getResponseNote = allNotes.data ? allNotes.data.find(({ content }) => content.includes("GetResponse Events:")) : undefined;

      let notesResponse;

      if (getResponseNote) {
        const oldContent = getResponseNote.content;
        const newContent = `${oldContent} <br/>${noteContent}`;

        notesResponse = await notesApi.updateNote(getResponseNote.id, { content: newContent });
      } else {
        const notesOptions = pipedrive.AddNoteRequest.constructFromObject({
          content: `GetResponse Events:<br/><br/> ${noteContent}`,
          personId,
          leadId,
          addTime: dateString,
          pinnedToPersonFlag: 1,
          pinnedToLeadFlag: true
        });

        notesResponse = await notesApi.addNote(notesOptions);
      }

      const noteConsoleMessage = notesResponse.success ? "Successfully added note to Pipedrive" : "Error adding note to Pipedrive";

      console.info(noteConsoleMessage);

      const dealFields = await dealFieldsApi.getDealFields();
      const engagementScoreField = dealFields.data.find((field) => field.name === "Engagement Score");

      const updateLeadOptions = {
        [engagementScoreField.key]: GRContactEngagementScore
      };

      const isSubscribtionChange = data.action === "subscribe" || data.action === "unsubscribe";
      if (isSubscribtionChange) {
        const listOptions = constants.marketingCustomFields[data.campaign_name];

        if (listOptions) {
          updateLeadOptions[listOptions.key] = listOptions[data.action];
        }
      }

      const updateLeadResponse = await leadsApi.updateLead(leadId, updateLeadOptions);

      const leadConsoleMessage = updateLeadResponse.success
        ? `Successfully updated deal Engagement Score ${isSubscribtionChange ? "and marketing fields" : ""}`
        : "Error updating deal Engagement Score and/or marketing fields";

      console.info(leadConsoleMessage);
    }
  } catch (err) {
    console.error(err);
  }
};
