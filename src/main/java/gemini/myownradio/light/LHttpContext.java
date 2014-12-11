package gemini.myownradio.light;

import gemini.myownradio.light.context.LHttpContextInterface;

/**
 * Created by Roman on 15.10.14.
 */
public class LHttpContext {

    private final LHttpContextInterface context;
    private LHttpHandler handler = null;

    public LHttpContext(LHttpContextInterface context) {
        this.context = context;
    }

    public void exec(LHttpHandler handler) {
        this.handler = handler;
    }

    public LHttpHandler getHandler() {
        return handler;
    }

}
