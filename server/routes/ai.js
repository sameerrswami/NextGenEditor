const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { callAI } = require("../utils/aiProvider");
const User = require("../models/User");

const router = express.Router();

/* =========================
   REUSABLE HANDLER
 ========================= */

function aiHandler(
 buildPrompt,
 responseField
){
 return async(req,res)=>{
   try{
     const prompt=
       buildPrompt(req);

     const result=
       await callAI(prompt);

     // Reward user with 1 coin (non-blocking)
     if (req.userId) {
       User.findByIdAndUpdate(req.userId, { $inc: { coins: 1 } })
         .catch(err => console.error("[AI] Coin Reward Error:", err));
     }

     return res.json({
       success:true,
       [responseField]:result
     });

   }catch(error){

     console.error(
       "AI Route Error:",
       error.message
     );

     return res.status(500).json({
       success:false,
       error:error.message
     });
   }
 };
}

/* =========================
   EXPLAIN CODE
========================= */

router.post(
"/explain",
authMiddleware,
aiHandler(
(req)=>{

const {
code,
language="code",
mode="detailed"
}=req.body;

if(!code)
 throw new Error(
 "Code is required"
 );

if(mode==="beginner"){
return `
Explain this ${language} code for a beginner.

Break it down line by line.
Use simple language and examples.

Code:
${code}
`;
}

return `
Explain this ${language} code in detail.

Include:
1 Logic
2 Functions
3 Complexity
4 Patterns used

Code:
${code}
`;

},
"explanation"
)
);

/* =========================
   ANALYZE CODE
========================= */

router.post(
"/analyze",
authMiddleware,
aiHandler(
(req)=>{

const {
code,
language="code"
}=req.body;

if(!code)
 throw new Error(
 "Code is required"
 );

return `
Analyze this ${language} code.

Provide:

1 Bugs/issues
2 Optimizations
3 Time complexity
4 Best practices
5 Security concerns

Code:
${code}
`;

},
"analysis"
)
);

/* =========================
   CONVERT CODE
========================= */

router.post(
"/convert",
authMiddleware,
aiHandler(
(req)=>{

const {
code,
fromLanguage,
toLanguage
}=req.body;

if(
!code ||
!fromLanguage ||
!toLanguage
){
throw new Error(
"Code, source and target languages required"
);
}

return `
Convert this ${fromLanguage}
code into ${toLanguage}.

Preserve logic.
Return clean converted code
with comments.

${code}
`;

},
"converted"
)
);

/* =========================
   DEBUG CODE
========================= */

router.post(
"/debug",
authMiddleware,
aiHandler(
(req)=>{

const {
code,
language="code",
errorMessage=""
}=req.body;

if(!code)
 throw new Error(
 "Code is required"
 );

if(errorMessage){
return `
Fix this ${language} code.

Error:
${errorMessage}

Code:
${code}

Return:
1 Bug explanation
2 Fixed code
3 Why it failed
`;
}

return `
Debug this ${language} code.

Find issues.
Fix them.
Explain what was wrong.

${code}
`;

},
"debugResult"
)
);

/* =========================
 TEST ROUTE
========================= */

router.get(
"/test",
async(req,res)=>{
try{
const result=
await callAI(
"Say hello from OpenRouter"
);

res.json({
success:true,
message:result
});

}catch(e){
res.status(500).json({
error:e.message
});
}
}
);

module.exports = router;