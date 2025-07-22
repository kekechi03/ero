import Parse from 'parse/dist/parse.min.js';

const PARSE_APP_ID = process.env.NEXT_PUBLIC_PARSE_APP_ID as string;
const PARSE_JS_KEY = process.env.NEXT_PUBLIC_PARSE_JS_KEY as string;
const PARSE_SERVER_URL = process.env.NEXT_PUBLIC_PARSE_SERVER_URL as string;
const PARSE_LIVEQUERY_URL = process.env.NEXT_PUBLIC_PARSE_LIVEQUERY_URL as string | undefined;

if (!Parse.applicationId) {
  Parse.initialize(PARSE_APP_ID, PARSE_JS_KEY);
  (Parse as any).serverURL = PARSE_SERVER_URL;
  if (PARSE_LIVEQUERY_URL) {
    (Parse as any).liveQueryServerURL = PARSE_LIVEQUERY_URL;
  }
}

export default Parse;
