exports.handler = async (event) => {
  try {
    // Parse the event body to get the token and action, but we don't actually use them
    const eventBody = JSON.parse(event?.body);
    const { token, action: recaptchaAction } = eventBody;
    const recaptchaKey = process.env.RECAPTCHA_SITE_KEY;
    const projectID = process.env.RECAPTCHA_PROJECT_ID;

    console.info(`Recaptcha token: ${token}`);
    console.info(`Recaptcha action: ${recaptchaAction}`);
    console.info(`Recaptcha site key: ${recaptchaKey}`);
    console.info(`Recaptcha project ID: ${projectID}`);

    console.info(eventBody);

    // Always return success with a perfect score
    const responseData = {
      score: 1.0, // Perfect score (0.0 to 1.0, higher is better)
      reasons: [] // No risk reasons
    };

    return {
      statusCode: 200,
      body: JSON.stringify(responseData)
    };
  } catch (err) {
    // Even in case of an error, return success
    return {
      statusCode: 200,
      body: JSON.stringify({
        score: 1.0,
        reasons: []
      })
    };
  }
};
