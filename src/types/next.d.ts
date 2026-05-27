declare module 'next/server' {
  export class NextRequest extends Request {
    json(): Promise<any>;
  }
  export class NextResponse extends Response {
    static json(body: any, init?: { status?: number }): NextResponse;
  }
}
