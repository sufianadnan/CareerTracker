/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */

const sendPayloadToNtfyEndpoint = async (data, ntfyEndpoint, type, emoji) => {
  try {
    const notifications = data.map((jobList) => {
      const companyName = jobList.company || 'Unknown Company';
      const jobName = jobList.postingTitle || 'Unknown Job Title';
      const status = jobList.status || 'Unknown Status';

      const notificationPayload = `${companyName} - Position: ${jobName} - Status: ${status}`;

      return fetch(`https://ntfy.sh/${ntfyEndpoint}`, {
        method: 'POST',
        body: notificationPayload,
        headers: {
          'Content-Type': 'text/plain',
          Tags: emoji,
          Priority: '4',
          Title: type,
        },
      }).then((response) => ({
        jobList,
        success: response.ok,
        status: response.status,
      }));
    });

    const responses = await Promise.all(notifications);
    responses.forEach((response) => {
      if (response.success) {
        console.log('Notification sent successfully.');
      } else {
        const statusCode = response.status ? response.status : 'Unknown';
        console.error(
          `Error: Unable to send notification. Status code: ${statusCode}`,
        );
      }
    });

    return responses;
  } catch (error) {
    console.error('Error sending data to ntfy endpoint:', error);
    return data.map((jobList) => ({ jobList, success: false, error }));
  }
};

export { sendPayloadToNtfyEndpoint };
