export async function unlockApp(page){
 await page.waitForFunction(()=>document.getElementById('nav')||document.querySelector('#gateForm[data-ready="true"]'));
 if(await page.locator('#nav').count())return;
 const password=process.env.ZHIYI_COURSE_PASSWORD;
 if(!password)throw Error('Set ZHIYI_COURSE_PASSWORD to test the protected course.');
 await page.getByLabel('课程密码',{exact:true}).fill(password);
 await page.locator('#unlockCourse').click();
 await page.locator('#nav button').first().waitFor();
}
