package gemini.myownradio.engine;import gemini.myownradio.engine.buffer.ConcurrentBuffer;import gemini.myownradio.engine.entity.Stream;import gemini.myownradio.ff.FFEncoderBuilder;import gemini.myownradio.LHttp.LHttpProtocol;import gemini.myownradio.tools.MORLogger;import gemini.myownradio.tools.io.IcyOutputStream;import java.io.IOException;import java.io.InputStream;import java.io.OutputStream;import java.sql.SQLException;/** * Created by Roman Gemini on 02.10.14. */public class ListenRadio {    private LHttpProtocol exchange;    private IcyOutputStream os;    private OutputStream sw;    private ConcurrentBuffer broadcast;    private boolean icy;    private Stream object;    private FFEncoderBuilder decoder;    private static MORLogger logger = new MORLogger(MORLogger.MessageKind.SERVER);    public ListenRadio(LHttpProtocol exchange, boolean icy, ConcurrentBuffer broadcast, FFEncoderBuilder decoder, Stream streamObject)            throws IOException {        this.broadcast = broadcast;        this.icy = icy;        this.object = streamObject;        this.decoder = decoder;        this.exchange = exchange;        logger.sprintf("Initializing listening session for client IP=%s", exchange.getClientIP());    }    public void listen() throws IOException, SQLException {        exchange.setContentType(decoder.getAudioFormat().getContent());        if (icy) {            logger.sprintf("Client supports icy metadata");            exchange.setHeader("icy-metadata", "1");            exchange.setHeader("icy-name", object.getName() + " @ " + (broadcast.getStreamKey().getBitrate() / 1000) + "K");            exchange.setHeader("icy-metaint", Integer.toString(IcyOutputStream.DEFAULT_METAINT));            os = new IcyOutputStream(exchange.getOutputStream());            os.setTitle(object.getName());            sw = os;        } else {            sw = exchange.getOutputStream();        }        int len;        byte[] buff = new byte[4096];        String prev = "";        FlowListener client = new FlowListener(exchange.getClientIP(),                exchange.getHeader("User-Agent"), decoder.getAudioFormatName(), object.getId());        logger.sprintf("Listening");        try (InputStream is = broadcast.getInputStream()) {            while ((len = is.read(buff)) != 0) {                if (icy && !prev.equals(broadcast.getTitle())) {                    prev = broadcast.getTitle();                    os.setTitle(prev);                }                sw.write(buff, 0, len);            }        } finally {            client.finish();        }    }}