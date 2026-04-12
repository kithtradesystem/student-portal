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

    const tp3Line = data.tp3 ? `\n> 🎯 Take Profit 3: \`${data.tp3}\`` : '';

    const forumRes = await fetch(`https://discord.com/api/v10/channels/${channelId}/threads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bot ${botToken}`
      },
      body: JSON.stringify({
        name: threadName,
        auto_archive_duration: 1440,
        message: {
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
> 🎯 Take Profit 1: \`${data.tp1 || '—'}\`
> 🎯 Take Profit 2: \`${data.tp2 || '—'}\`${tp3Line}
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
        }
      })
    });

    if (!forumRes.ok) {
      const err = await forumRes.text();
      console.error('Forum error:', err);
      return { statusCode: 500, body: 'Failed to post to forum' };
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
