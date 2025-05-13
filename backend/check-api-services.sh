#!/bin/bash
#
# check-api-services.sh
# Script to check the availability of external APIs used by TradeEasy
#

echo "================================================================="
echo "TradeEasy API Service Check"
echo "================================================================="

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo "Loaded configuration from .env file"
else
  echo "No .env file found, using default values"
fi

# Function to check an API endpoint
check_api() {
  local name=$1
  local url=$2
  local api_key=$3
  local key_name=$4
  
  echo -n "Checking ${name}... "
  
  if [[ -z "$api_key" || "$api_key" == *"your_"* || "$api_key" == *"placeholder"* ]]; then
    echo -e "\e[33mSKIPPED\e[0m (No valid API key configured)"
    echo "    Using enhanced fallback data instead"
    return
  fi
  
  # Construct request with appropriate headers
  response=$(curl -s -o /dev/null -w "%{http_code}" -m 5 \
    -H "User-Agent: TradeEasy/1.0" \
    -H "Accept: application/json" \
    -H "${key_name}: ${api_key}" \
    "${url}")
  
  if [[ $response == 2* ]]; then
    echo -e "\e[32mOK\e[0m (HTTP ${response})"
  elif [[ $response == 3* ]]; then
    echo -e "\e[33mREDIRECT\e[0m (HTTP ${response})"
    echo "    API is redirecting. This may cause issues in some cases."
  elif [[ $response == 4* ]]; then
    echo -e "\e[31mFAILED\e[0m (HTTP ${response})"
    echo "    Client error. Check your API key and parameters."
    echo "    Using enhanced fallback data instead"
  elif [[ $response == 5* ]]; then
    echo -e "\e[31mFAILED\e[0m (HTTP ${response})"
    echo "    Server error. The API service may be down."
    echo "    Using enhanced fallback data instead"
  else
    echo -e "\e[31mFAILED\e[0m (No response)"
    echo "    Could not connect to API. Using enhanced fallback data instead."
  fi
}

# Check Quandl/Nasdaq API
echo -e "\n\e[1mQuandl API (Price Data)\e[0m"
check_api "Quandl API" "${QUANDL_API_URL:-https://www.quandl.com/api/v3}/info" \
  "${QUANDL_API_KEY}" "X-Api-Token"

# Check OpenWeatherMap API
echo -e "\n\e[1mOpenWeatherMap API (Weather Data)\e[0m"
check_api "OpenWeatherMap API" "${OPENWEATHERMAP_API_URL:-https://api.openweathermap.org/data/2.5}/ping" \
  "${OPENWEATHERMAP_API_KEY}" "X-Api-Key"

# Check USITC DataWeb API
echo -e "\n\e[1mUSITC DataWeb API (Tariff Data)\e[0m"
check_api "DataWeb API" "${DATAWEB_API_URL:-https://dataweb.usitc.gov/api/v1}/status" \
  "${DATAWEB_AUTH_TOKEN}" "Authorization"

# Check Google Cloud AI 
echo -e "\n\e[1mGoogle Cloud AI API (Forecasting)\e[0m"
check_api "Google Cloud AI API" "${GOOGLE_CLOUD_AI_URL}" \
  "${GOOGLE_CLOUD_AI_API_KEY}" "X-Goog-Api-Key"

# Summary
echo -e "\n\e[1mSummary\e[0m"
echo "TradeEasy will attempt to use real data from configured APIs"
echo "and automatically fall back to enhanced synthetic data when needed."
echo -e "See \e[1mDATA_STRATEGY.md\e[0m for more information about our data approach."
echo "================================================================="

exit 0