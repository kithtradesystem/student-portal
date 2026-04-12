exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const botToken = process.env.DISCORD_BOT_TOKEN;
    const channelId = '1490532319205916672';

    const threadName = `${data.symbol} | ${data.timeframe} | ${data.bias} — ${data.username}`;

    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
      weekday: 'short', month: 'short', day: 'numeric',
      year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    // Step 1 — Create thread with a message inside it
    const threadRes = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bot ${botToken}`
      },
      body: JSON.stringify({
        content: `📊 New chart submission from **${data.username}**`,
        embeds: [{
          title: `📊 ${data.symbol} | ${data.timeframe} | ${data.type}`,
          description:
`👤 **Student:** ${data.username}
${data.bias === 'BULLISH' ? '🟢' : '🔴'} **${data.bias} BIAS**

**📍 Primary Zone — ${data.primaryZone}**
> 🎯 Zone Range: \`${data.zoneRange || '—'}\`
> 💰 Entry: \`${data.entry || '—'}\`
> 🛑 Stop Loss: \`${data.sl || '—'}\`
> 🎯 Take Profit: \`${data.tp || '—'}\`
> ⚖️ Est. RR: \`${data.rr || '—'}\`

**🔀 Confluences**
${data.confluences || '—'}

**📐 Fib Level**
${data.fib || 'None'}

**📈 Moving Averages**
${data.mas || 'None'}

**📖 What I See**
${data.analysis || '—'}

${data.chartLink ? `**📈 Chart:** [View on TradingView](${data.chartLink})` : ''}`,
          color: data.bias === 'BULLISH' ? 3866394 : 15548997,
          footer: { text: `KithTradeLab · Student Submission · ${timestamp} EST` }
        }]
      })
    });

    if (!threadRes.ok) {
      const err = await threadRes.text();
      console.error('Message error:', err);
      return { statusCode: 500, body: 'Failed to post message' };
    }

    const msg = await threadRes.json();

    // Step 2 — Create thread from that message
    const createThread = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages/${msg.id}/threads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bot ${botToken}`
      },
      body: JSON.stringify({
        name: threadName,
        auto_archive_duration: 1440
      })
    });

    if (!createThread.ok) {
      const err = await createThread.text();
      console.error('Thread error:', err);
      return { statusCode: 500, body: 'Failed to create thread' };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };

  } catch (err) {
    console.error('Error:', err);
    return { statusCode: 500, body: 'Server error' };
  }
};