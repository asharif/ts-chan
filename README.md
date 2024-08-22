![pr-workflow](https://github.com/asharif/ts-channel/actions/workflows/build-test.yml/badge.svg)
![publish-workflow](https://github.com/asharif/ts-channel/actions/workflows/publish.yml/badge.svg)
# ts-channel
`channel` like structure for TypeScript. Inspired by golang `channels` and Java's `LinkedBlockedingQueue`. Can be used as a `Semaphore` as well.

## Requirements
1. node v20.5.1
2. yarn 1.22.22

## Local development
1. `yarn build` - to build
2. `yarn unit-test` - to run tests

## Usage

### Example
From the test cases:
```
const chan:Chan<string> = new Chan<string>();
const i = setInterval(async () => {expect(await chan.take()).toBe("hello"); clearInterval(i)}, 1000);
await chan.offer("hello");
await chan.offer("world"); //<--blocks here as by default channel buffer size is 1
expect(await chan.take()).toBe("world");
```
See test cases in `src/chan.test.ts` for more use cases
