/**
 * Chan is a simple implementation of a channel that can be used to communicate between async functions.
 */
export class Chan<T> {
  private buffer: T[];
  private maxSize: number;
  private offers:Function[]
  private takes:Function[];
  private logger: any;
  private closed:boolean;
  /**
   * 
   * @param maxSize - the maximum size of the channel buffer
   * @param logger  - a logger object that has a debug method
   */
  constructor(maxSize: number = 1 , logger:{debug:(msg:string)=>void} | undefined  = undefined) {
    if(maxSize < 1) 
      throw new Error("Size must be greater than 0");

    this.maxSize = maxSize;
    this.buffer = [];
    this.offers = [];
    this.takes = [];  
    this.logger = logger;
    this.closed = false;
  }

  /**
   * Closes the channel. This will prevent any more values from being added to the channel.
   */
  public close() {
    this.closed = true;
  }

  /**
   * 
   * @returns true if the channel is closed, false otherwise
   */
  public isClosed():boolean {
    return this.closed;
  }

  /**
   * Adds a value to the channel. If the buffer is full, the function will block until there is space in the buffer. 
   * @param val - the value to be added to the channel
   */
  public async offer(val:T):Promise<void> {
    if(this.closed) {
      throw new Error("Channel is closed");
    }
    if(this.buffer.length + 1 > this.maxSize) {
      this.logger?.debug("buffer is full, waiting for space"); 
      const p = new Promise((resolve) => {
        this.offers.push(resolve);
        this.logger?.debug("offers buffer length: " + this.offers.length);
      });
      await p;
    } 
    this.logger?.debug("adding value to buffer"); 
    this.buffer.push(val);
    if(this.takes.length > 0) {
      //resolve first take that is waiting
      this.logger?.debug("resolving take"); 
      this.takes.shift()!();
    }
  }
  /**
   * Removes and resturns a value from the channel. If the buffer is empty, the function will block until there is a value in the buffer.
   * @returns the value from the channel
   */
  public async take():Promise<T | undefined> {
    if(this.buffer.length === 0) {
      this.logger?.debug("buffer is empty, waiting for value");
      const p = new Promise((resolve) => {
        this.takes.push(resolve);
        this.logger?.debug("takes buffer length: " + this.takes.length);
      }); 
      await p;
    } 
    const val = this.buffer.shift(); 
    if(this.offers.length > 0) {
      //resolve the first offer that is waiting
      this.logger?.debug("resolving offer"); 
      this.offers.shift()!();
    }
    return val;
  }
}