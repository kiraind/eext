import { parseDocument } from 'htmlparser2'

const wsListener = parseDocument(`<script>
  new WebSocket(\`\${window.location.protocol.replace('http', 'ws')}//\${window.location.host}/\`).onmessage = msg => {
    const event = JSON.parse(msg.data);
    if(event.type === 'hotreload') {
      console.log('Detected change, reloading page...');
      window.location.reload();
    }
  };
</script>
`)

export default wsListener
