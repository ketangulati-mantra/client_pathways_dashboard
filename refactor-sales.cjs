const fs = require('fs');
let code = fs.readFileSync('src/views/SalesPartnerLessonPage.jsx', 'utf8');

// 1. Add import
if (!code.includes('useTranslation')) {
  code = code.replace(/import React(.*?);/, "import React$1;\nimport { useTranslation } from 'react-i18next';");
}

// 2. Inject hook in the component
const regex = new RegExp(`(export default function SalesPartnerLessonPage\\(\\{ onBack \\}\\) \\{)`, 'm');
code = code.replace(regex, `$1\n  const { t } = useTranslation('sales-partner');\n`);

// 3. Replace text
code = code.replace(/const LESSON_TITLE = 'Becoming a Mantra Sales Partner';/, "const LESSON_TITLE = 'Becoming a Mantra Sales Partner';"); 
// wait, since the arrays are defined OUTSIDE the component, they don't have access to `t()`. 
// I need to move the arrays INSIDE the component or use translation keys in the arrays and translate during render.
// Since it's easier to translate during render, I'll update the arrays to use translation keys.

code = code.replace(/'Introduce Companies'/, "t('help_items.intro_companies')");
code = code.replace(/'Recommend organizations that may benefit from EAP\.'/,"t('help_items.intro_companies_desc')");
code = code.replace(/'Make Introductions'/, "t('help_items.make_intros')");
code = code.replace(/'Email, LinkedIn or personal introductions are enough\.'/,"t('help_items.make_intros_desc')");
code = code.replace(/'Share Opportunities'/, "t('help_items.share_opps')");
code = code.replace(/'Mention Mantra when appropriate in your network\.'/,"t('help_items.share_opps_desc')");
code = code.replace(/'Connect Decision Makers'/, "t('help_items.connect_dm')");
code = code.replace(/'Introduce HR teams, founders, managers or wellness leaders\.'/,"t('help_items.connect_dm_desc')");

code = code.replace(/'Commission on successful deals'/, "t('benefits.commission')");
code = code.replace(/'Earn Mantra Points'/, "t('benefits.points')");
code = code.replace(/'No sales targets'/, "t('benefits.no_targets')");
code = code.replace(/'Help expand mental healthcare'/, "t('benefits.expand')");

code = code.replace(/'Identify a company'/, "t('timeline.identify')");
code = code.replace(/'Think of organizations in your network\.'/,"t('timeline.identify_desc')");
code = code.replace(/'Introduce Mantra'/, "t('timeline.intro')");
code = code.replace(/'Start the conversation via email or LinkedIn\.'/,"t('timeline.intro_desc')");
code = code.replace(/'Business team takes over'/, "t('timeline.biz_team')");
code = code.replace(/'We handle demos, negotiations, and closing\.'/,"t('timeline.biz_team_desc')");
code = code.replace(/'Company signs up'/, "t('timeline.signup')");
code = code.replace(/'The organization officially partners with Mantra\.'/,"t('timeline.signup_desc')");
code = code.replace(/'Earn commission & rewards'/, "t('timeline.earn')");
code = code.replace(/'Receive your financial commission and Mantra Points\.'/,"t('timeline.earn_desc')");

code = code.replace(/'Introduce a Client'/, "t('participate_items.intro_client')");
code = code.replace(/'Introduce MantraCare to a client or professional in your network\.'/,"t('participate_items.intro_client_desc')");
code = code.replace(/'Recommend Companies'/, "t('participate_items.rec_companies')");
code = code.replace(/'Share organizations where Employee Assistance Programs \\(EAPs\\) could be valuable\.'/,"t('participate_items.rec_companies_desc')");
code = code.replace(/'Make an Introduction'/, "t('participate_items.make_intro')");
code = code.replace(/'Connect our team with an HR leader or decision-maker through LinkedIn or email\.'/,"t('participate_items.make_intro_desc')");
code = code.replace(/'Learn More'/, "t('participate_items.learn_more')");
code = code.replace(/'Not ready today\\? That\\'s okay—you can explore the program and participate whenever you\\'re comfortable\.'/,"t('participate_items.learn_more_desc')");

// Wait, the arrays are outside the component! Moving them inside the component so they can access `t()`.
// Actually, it's safer to just move them inside the component body in my node script.
