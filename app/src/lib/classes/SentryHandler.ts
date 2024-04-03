export default class SentryHandler {
    public a: string;

    public constructor(a: string) {
        this.a = a;
    }

    public aa = () => {
        return this.a + "a"; // obviously not finished, L
    };
}
