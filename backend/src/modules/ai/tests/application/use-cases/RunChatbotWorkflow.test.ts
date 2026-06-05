import { RunChatbotWorkflow } from '../../../application/use-cases/RunChatbotWorkflow';
import { OpenRouterService } from '../../../infrastructure/services/OpenRouterService';
import { AnalyticsContextProvider } from '../../../application/context/AnalyticsContextProvider';

jest.mock('../../../infrastructure/services/OpenRouterService');

describe('RunChatbotWorkflow Use Case', () => {
  const mockGenerateJson = OpenRouterService.generateJson as jest.Mock;
  const mockGenerateText = OpenRouterService.generateText as jest.Mock;
  let spyContextProvider: jest.SpyInstance;

  beforeAll(() => {
    // Mock the context provider static method to return simple text instantly
    spyContextProvider = jest.spyOn(AnalyticsContextProvider, 'getContextForIntent')
      .mockResolvedValue('Mocked analytics database context data.');
  });

  afterAll(() => {
    spyContextProvider.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should run the workflow and route queries to the correct node', async () => {
    mockGenerateJson.mockResolvedValue({ intent: 'employment' });
    mockGenerateText.mockResolvedValue('The employment rate of ASTU SWE graduates is 100%.');

    const workflow = new RunChatbotWorkflow();
    const result = await workflow.execute('What is the employment rate of SWE?');

    expect(result.intent).toBe('employment');
    expect(result.response).toBe('The employment rate of ASTU SWE graduates is 100%.');
    expect(mockGenerateJson).toHaveBeenCalled();
    expect(mockGenerateText).toHaveBeenCalled();
    expect(spyContextProvider).toHaveBeenCalledWith('employment');
  });

  it('should route report requests correctly to the report node', async () => {
    mockGenerateJson.mockResolvedValue({ intent: 'report' });
    mockGenerateText.mockResolvedValue('### ACCREDITATION REPORT OUTCOME...');

    const workflow = new RunChatbotWorkflow();
    const result = await workflow.execute('Generate accreditation report');

    expect(result.intent).toBe('report');
    expect(result.response).toBe('### ACCREDITATION REPORT OUTCOME...');
    expect(mockGenerateJson).toHaveBeenCalled();
    expect(mockGenerateText).toHaveBeenCalled();
    expect(spyContextProvider).toHaveBeenCalledWith('report');
  });
});
