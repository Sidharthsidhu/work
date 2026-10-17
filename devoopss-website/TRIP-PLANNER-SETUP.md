# Set up "Plan a trip"

The **+ Plan a trip** button saves new trips to a Google Sheet that you own. You set this up once, in about 10 minutes.

## 1. Make the sheet
1. Open https://sheets.new while signed in to your Google account.
2. Name it **Dev_oopss trips**.

## 2. Add the script
1. In the sheet, click **Extensions → Apps Script**.
2. Delete everything in the editor, then paste in the whole of [`apps-script/Code.gs`](apps-script/Code.gs).
3. Change `change-me` on the `const PASSCODE = "change-me";` line to your group's passcode, for example `const PASSCODE = "wayanad2026";`.
4. Click the 💾 **Save** icon.

## 3. Give it permission
1. In the function list at the top (next to **Debug**), pick **setup**, then click **Run**.
2. Google asks for permission. Click **Review permissions**, pick your account, then **Advanced → Go to Dev_oopss trips (unsafe) → Allow**.
   Google shows "unsafe" for every script it hasn't reviewed. This one is your own.
3. The sheet now has a **Trips** tab, and your Drive has a **Dev_oopss trip photos** folder.

## 4. Publish it
1. Click **Deploy → New deployment**.
2. Click the ⚙️ next to "Select type" and choose **Web app**.
3. Set **Execute as: Me** and **Who has access: Anyone**.
4. Click **Deploy** and copy the **Web app URL**. It ends in `/exec`.

## 5. Connect the website
In `index.html`, put the URL between the quotes on this line:

```js
const TRIPS_API = "";
```

(Or send the URL to Claude and it will do it.) The **+ Plan a trip** button appears once the change is live.

## Day to day
- **Add a trip:** the button on the website. The person adding it needs the passcode.
- **Edit or delete a trip:** change or delete its row in the **Trips** tab of the sheet.
- **Change the passcode:** edit the `PASSCODE` line in Apps Script, then **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**. The web app URL stays the same.
- **If you change the script code**, redeploy the same way (New version).
