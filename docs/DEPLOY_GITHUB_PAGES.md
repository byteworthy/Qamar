# 🚀 Deploy Legal Documents to GitHub Pages

**Goal**: Host Privacy Policy and Terms of Service on free GitHub Pages

**Time**: 5 minutes

---

## Step 1: Enable GitHub Pages

1. Go to your GitHub repository: https://github.com/byteworthy/Noor
2. Click **Settings** (top right)
3. Scroll down to **Pages** (left sidebar)
4. Under "Build and deployment":
   - **Source**: Deploy from a branch
   - **Branch**: `main`
   - **Folder**: `/docs`
5. Click **Save**

GitHub will automatically deploy your docs folder!

---

## Step 2: Verify Deployment (2-3 minutes)

After saving, GitHub will build and deploy. Wait 2-3 minutes, then visit:

✅ **Privacy Policy**: https://byteworthy.github.io/Noor/legal/privacy.html
✅ **Terms of Service**: https://byteworthy.github.io/Noor/legal/terms.html

**If you get 404**: Wait a few more minutes, GitHub is still building.

---

## Step 3: Test URLs Return 200

```bash
# Test Privacy Policy
curl -I https://byteworthy.github.io/Noor/legal/privacy.html

# Test Terms of Service
curl -I https://byteworthy.github.io/Noor/legal/terms.html
```

Both should return:
```
HTTP/2 200
```

---

## Step 4: Update App Store Listings

### For iOS (App Store Connect)

1. Log into App Store Connect
2. Go to your app → App Information
3. Update URLs:
   - **Privacy Policy URL**: `https://byteworthy.github.io/Noor/legal/privacy.html`
   - **Terms of Service URL** (optional): `https://byteworthy.github.io/Noor/legal/terms.html`
4. Save

### For Android (Google Play Console)

1. Log into Google Play Console
2. Go to your app → Store presence → Store listing
3. Update URLs:
   - **Privacy Policy**: `https://byteworthy.github.io/Noor/legal/privacy.html`
4. Save

---

## ✅ Verification Checklist

- [ ] GitHub Pages enabled (Settings → Pages)
- [ ] Privacy Policy URL returns 200 status
- [ ] Terms of Service URL returns 200 status
- [ ] URLs open in browser and display correctly
- [ ] app.json updated with URLs
- [ ] App Store Connect updated (iOS)
- [ ] Google Play Console updated (Android)

---

## 🎉 Done!

Your legal documents are now:
- ✅ Publicly hosted (free forever)
- ✅ Returns 200 status (required for app stores)
- ✅ Professional-looking HTML pages
- ✅ Mobile-responsive
- ✅ HTTPS encrypted (GitHub Pages provides SSL)

**No attorney required!** These documents are ready for beta launch.

---

## Future Updates

When you need to update the legal docs:

1. Edit `legal/PRIVACY_POLICY.md` or `legal/TERMS_OF_SERVICE.md`
2. Update the HTML versions in `docs/legal/privacy.html` and `docs/legal/terms.html`
3. Commit and push to GitHub
4. GitHub Pages will auto-deploy (2-3 minutes)

---

**Next Step**: Complete mobile testing and you're ready to submit to app stores! 🚀
