'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'uw-explorer-v21-contact-share.js'),'utf8');
const page=fs.readFileSync(path.join(root,'earningstool-vfinal-coaching-preview-v22.html'),'utf8');
const match=source.match(/  async function verifyShareOwner\(\)\{[\s\S]*?\n  \}/);
assert.ok(match,'Verified public Partner check must exist');
function guard(partnerId,fetch){
  return new Function('partnerId','fetch','CLOUD_URL',match[0]+'\nreturn verifyShareOwner();')
    (partnerId,fetch,'https://example.test/cloud');
}
const fetchGood=async()=>({json:async()=>({ok:true,partner:{partner_id:'G16990',name:'Test UW Partner'}})});
test('verified UW Partner ID permits sharing',async()=>{
  assert.equal((await guard('G16990',fetchGood)).name,'Test UW Partner');
});
test('legacy p_ ID cannot be shared and never triggers a network call',async()=>{
  let count=0;
  await assert.rejects(()=>guard('p_a544c810842f48bab89f0d6cb1795c5c',async()=>{count++;return fetchGood();}),/no valid UW Partner ID/);
  assert.equal(count,0);
});
test('public profile must match link owner',async()=>{
  await assert.rejects(()=>guard('AM2802',fetchGood),/unavailable/);
});
test('both first share and friend re-share verify before showing action buttons',()=>{
  assert.match(source,/window\.openV21Share=async function\(\)\{\s*if\(!\(await canShareWithPartner\(\)\)\)return;/);
  assert.match(source,/window\.openV21FriendShare=async function\(\)\{\s*if\(!\(await canShareWithPartner\(\)\)\)return;/);
  assert.match(page,/Coaching Preview v22\.1/);
  assert.match(page,/20261017-v22\.1-partner-verification/);
});
