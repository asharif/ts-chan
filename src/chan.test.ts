import {describe, expect, test} from '@jest/globals';
import { Chan } from './chan';
describe("Testing Chan", () => {
    it("should test regular offer and takes without blocking ", async () => {
      const chan:Chan<number> = new Chan<number>(100, console);
      for(let i=0; i<100; i++) {
        await chan.offer(i);
      }
      for(let i=0; i<100; i++) {
        expect(await chan.take()).toBe(i);
      }
    });

    it("should test blocking on offer", async () => {
      const chan:Chan<string> = new Chan<string>(1, console);
      const i = setInterval(async () => {expect(await chan.take()).toBe("hello"); clearInterval(i)}, 1000);
      await chan.offer("hello");
      await chan.offer("world");
      expect(await chan.take()).toBe("world");
    });

  it("should test blocking on take", async () => {
      const chan:Chan<string> = new Chan<string>(1, console);
      const i = setInterval(async () => {await chan.offer("hello"); clearInterval(i)}, 1000);
      expect(await chan.take()).toBe("hello");
  });

  it("should test invalid size channel", async () => {
      expect(()=>new Chan<string>(0, console)).toThrowError("Size must be greater than 0");
  });

  it("should test default constructor", async () => {
      const chan:Chan<string> = new Chan<string>();
      chan.take();
      await chan.offer("hello");
      await chan.offer("world");
      expect(await chan.take()).toBe("world");
  });

  it("should test single item no logging", async () => {
      const chan:Chan<string> = new Chan<string>(1);
      chan.offer("hello");
      expect(await chan.take()).toBe("hello");
  });

  it("should test multiple offers that block from different contexts", async () => {
      const chan:Chan<number> = new Chan<number>();
      for(let j=0; j<10; j++) {
        chan.offer(j);
      }
      const block:Chan<undefined> = new Chan<undefined>();
      const i = setInterval(async () => {await block.offer(undefined); clearInterval(i)},500);
      await block.take();
      for(let i=0; i<10; i++) {
        expect(await chan.take()).toBe(i);
      }
  });

  it("should throw on offers for a closed channel", async () => {
      const chan:Chan<number> = new Chan<number>();
      await chan.offer(1);
      chan.close();
      expect(chan.isClosed()).toBe(true);
      expect(async ()=> {await chan.offer(2)}).rejects.toThrowError("Channel is closed");
  });

});