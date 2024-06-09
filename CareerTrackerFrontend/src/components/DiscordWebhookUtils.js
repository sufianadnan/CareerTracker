const sendPayloadToDiscordWebhook = (data, webhook, type) => {
  const notifications = data.map((job) => {
    const payload = {
      username: 'CareerTracker',
      avatar_url:
        'https://careertracker.gitbook.io/~gitbook/image?url=https%3A%2F%2F759356917-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FMBeAXACzwYAhwb8lA7DJ%252Fuploads%252FjGW6n8cIAiaUubpZW3Lu%252Fimage.png%3Falt%3Dmedia%26token%3D7c9438ae-7a2b-4bc1-98e9-4634fb002607&width=768&dpr=4&quality=100&sign=9c03d542048885b8e798f63cd78ae6eb84ddba975c6356f33a0fa785824f14ae',
      attachments: [],
      embeds: [
        {
          fields: [
            {
              name: `${job.company || 'Unknown Company'} - ${job.postingTitle || 'Unknown Job Title'}`,
              value: `Status: ${job.status || 'Unknown Status'}`,
              inline: false,
            },
          ],
          author: {
            name: 'CareerTracker',
            url: 'https://github.com/sufianadnan',
          },
          footer: {
            text: `CareerTracker - ${type} APPLICATIONS`,
          },
          timestamp: new Date().toISOString(),
          thumbnail: {
            url: 'https://careertracker.gitbook.io/~gitbook/image?url=https%3A%2F%2F759356917-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FMBeAXACzwYAhwb8lA7DJ%252Fuploads%252FjGW6n8cIAiaUubpZW3Lu%252Fimage.png%3Falt%3Dmedia%26token%3D7c9438ae-7a2b-4bc1-98e9-4634fb002607&width=768&dpr=4&quality=100&sign=9c03d542048885b8e798f63cd78ae6eb84ddba975c6356f33a0fa785824f14ae',
          },
        },
      ],
    };

    return fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((response) => ({
        job,
        success: response.ok,
        status: response.status,
      }))
      .catch((error) => ({
        job,
        success: false,
        error,
      }));
  });

  return Promise.all(notifications);
};

export { sendPayloadToDiscordWebhook };
