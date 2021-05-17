
const io = (window as any).io as any;

class SocketIoConnection extends WebSocketConnection {
    public SocketIO: any;
    protected SocketIOConnected = false;

    constructor() {
        super();

    }

    public get bytesAvailable(): number {
        return this._InputBuffer.bytesAvailable;
    }

    public close(): void {
        if(this.SocketIOConnected) {
            this.SocketIO.close();
        }
    }

    public connect(hostname: string, port: number, urlPath: string, forceWss: boolean, proxyHostname?: string, proxyPort?: number, proxyPortSecure?: number): void {
        if(!io) {
            throw "socket.io-client not found"
        }

        const host = `${forceWss ? 'wss' : 'ws'}://${hostname}:${port}/`;

        this.SocketIO = io(host);
        this.SocketIO.on("connect", 
            this.handleSocketIOConnect);  
        this.SocketIO.on("disconnect", 
            this.handleSocketIODisconnect);  
        this.SocketIO.on("data", 
            this.handleSocketIOData);
    }

    protected handleSocketIOConnect = () =>
    {
        this.SocketIOConnected = true;
        this.onconnect.trigger();
        this.SocketIO.emit("geometry", 80, 25);
    }

    protected handleSocketIODisconnect = () => {
        if(this.SocketIOConnected) {
            this.onclose.trigger();
        }
        this.SocketIOConnected = false;
    }

    protected handleSocketIOData = (data) => 
    {
        let bytes = [];

        for (let i = 0; i < data.length; ++i) {
            let code = data.charCodeAt(i);
            bytes = bytes.concat([code]);
        }

        data = bytes;

        if (this._InputBuffer.bytesAvailable === 0) { 
            this._InputBuffer.clear(); 
        }

        const OldPosition: number = this._InputBuffer.position;
        this._InputBuffer.position = this._InputBuffer.length;

        const Data: ByteArray = new ByteArray();

        let i: number;
        for (i = 0; i < data.length; i++) {
            Data.writeByte(data[i]);
        }
        Data.position = 0;

        this.NegotiateInbound(Data);

        // Restore the old buffer position
        this._InputBuffer.position = OldPosition;

        // Raise ondata event
        this.ondata.trigger();
    }

    public get connected(): boolean {
        return this.SocketIOConnected;
    }

    public Send(data: number[]): void {
        this.SocketIO.emit('data', data);
    }
}
