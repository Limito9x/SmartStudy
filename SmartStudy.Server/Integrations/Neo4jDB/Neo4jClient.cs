using Neo4j.Driver;

namespace SmartStudy.Server.Integrations.Neo4j
{
    public class Neo4jClient : INeo4jClient
    {
        private readonly IDriver _driver;

        public Neo4jClient(IDriver driver)
        {
            _driver = driver;
        }

    }
}