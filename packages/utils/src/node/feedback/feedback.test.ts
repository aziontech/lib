import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import feedback from './feedback';

describe('feedback', () => {
  let stdoutSpy: ReturnType<typeof jest.spyOn>;

  beforeAll(() => {
    stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => false);
  });

  afterAll(() => {
    stdoutSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it('should successfully run the feedback prebuild function', () => {
    const spy = jest.spyOn(feedback.prebuild, 'info');
    feedback.prebuild.info('Detected Next.js version:', { arg1: 'nextVersion' });
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith('Detected Next.js version:', { arg1: 'nextVersion' });
    spy.mockRestore();
  });

  it('should successfully run the feedback with change globalScope', () => {
    const customFeedback = feedback;
    const spy = jest.spyOn(customFeedback, 'globalScope');
    feedback.globalScope('Custom').server.info('Hello feedback');
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith('Custom');
    spy.mockRestore();
  });
});
