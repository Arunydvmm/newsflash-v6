# NewsFlash Ad Management Setup Guide

## Why Ads Are Not Showing

Ads are not visible on your website because:

1. **All ad slots are disabled by default** (OFF)
2. **No ad scripts have been added** (empty)
3. **You need to enable slots and add ad network scripts**

---

## How to Enable Ads

### Step 1: Go to Ad Management
1. Login to Admin Panel
2. Click **"📢 Ad Management"** in the sidebar
3. You'll see 8 available ad slots

### Step 2: Enable Ad Slots
For each slot you want to use:
1. Click the **toggle switch** to turn it **ON** (should show green)
2. Paste your ad network script in the **"Ad Script"** textarea
3. Click **"Save All"** button

### Step 3: Get Ad Scripts

You need ad scripts from an ad network. Here are popular options:

#### Option 1: Google AdSense (Recommended)
1. Go to [Google AdSense](https://www.google.com/adsense/)
2. Sign up or login
3. Create ad units for each slot size:
   - **728×90** (Header Leaderboard, Mid-Article)
   - **300×250** (Sidebar Rectangle, Cricket Sidebar, Sarkari Sidebar)
   - **320×50** (Mobile Sticky Footer)
4. Copy the ad code (looks like):
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-xxxxxxxxxxxxxxxx"
     crossorigin="anonymous"></script>
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-xxxxxxxxxxxxxxxx"
     data-ad-slot="xxxxxxxxxx"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

#### Option 2: Other Ad Networks
- **Mediavine**: https://www.mediavine.com/
- **AdThrive**: https://www.adthrive.com/
- **Propeller Ads**: https://www.propellerads.com/
- **Infolinks**: https://www.infolinks.com/
- **Taboola**: https://www.taboola.com/

---

## Available Ad Slots

### 1. **Popunder** 🌐
- **Size**: Global (any size)
- **Position**: Injected globally on all pages
- **Best For**: Popunder ads, full-page takeovers
- **Note**: Loads on every page visit

### 2. **Header Leaderboard** 📏
- **Size**: 728×90 pixels
- **Position**: Below navigation in site header
- **Best For**: Banner ads, Google AdSense
- **Visibility**: High (seen by all visitors)

### 3. **Sidebar Rectangle** 📦
- **Size**: 300×250 pixels
- **Position**: Right sidebar on homepage
- **Best For**: Display ads, Google AdSense
- **Visibility**: Medium (homepage only)

### 4. **Native Banner** 📰
- **Size**: Native (flexible)
- **Position**: Below article grid on homepage
- **Best For**: Native ads, sponsored content
- **Visibility**: High (homepage only)

### 5. **Mid-Article Banner** 📄
- **Size**: 728×90 pixels
- **Position**: Mid-way through article body
- **Best For**: In-content ads, Google AdSense
- **Visibility**: High (article pages)

### 6. **Mobile Sticky Footer** 📱
- **Size**: 320×50 pixels
- **Position**: Sticky bottom on mobile devices
- **Best For**: Mobile ads, high engagement
- **Visibility**: Very High (mobile users)

### 7. **Cricket Sidebar** 🏏
- **Size**: 300×250 pixels
- **Position**: Cricket section sidebar
- **Best For**: Sports-related ads
- **Visibility**: Medium (cricket page only)

### 8. **Sarkari Sidebar** 🏛
- **Size**: 300×250 pixels
- **Position**: Sarkari Naukri section sidebar
- **Best For**: Job-related ads
- **Visibility**: Medium (sarkari page only)

---

## Step-by-Step Setup Example (Google AdSense)

### 1. Create AdSense Account
- Go to https://www.google.com/adsense/
- Click "Sign up now"
- Follow the verification process

### 2. Create Ad Units
For each slot, create a matching ad unit:

**For Header Leaderboard (728×90):**
1. Go to Ads → Ad units
2. Click "New ad unit"
3. Select "Display ads"
4. Set size to 728×90
5. Name it "Header Leaderboard"
6. Copy the code

**For Sidebar Rectangle (300×250):**
1. Repeat above steps
2. Set size to 300×250
3. Name it "Sidebar Rectangle"

### 3. Paste Scripts in NewsFlash
1. Go to Admin → Ad Management
2. Find "Header Leaderboard" slot
3. Toggle it **ON**
4. Paste the Google AdSense code in the textarea
5. Click "Save All"

### 4. Verify Ads Are Showing
1. Go to your website homepage
2. Refresh the page
3. You should see ads in the enabled slots
4. Wait 24-48 hours for Google AdSense to start serving ads

---

## Troubleshooting

### Issue: Ads Still Not Showing
**Solution**: 
1. Make sure the toggle is **ON** (green)
2. Make sure you pasted the **complete script** (including `<script>` tags)
3. Wait 24-48 hours for ad network to activate
4. Check browser console for errors (F12 → Console)

### Issue: Ad Script Error
**Solution**:
1. Copy the **entire ad code** from your ad network
2. Include both the `<script>` tags and the `<ins>` or `<div>` tags
3. Don't modify the code
4. Save and refresh

### Issue: Ads Show But No Revenue
**Solution**:
1. Wait 24-48 hours for ads to activate
2. Make sure you have enough traffic
3. Check your ad network dashboard for approval status
4. Verify ad units are properly configured

### Issue: Only Some Ads Show
**Solution**:
1. Check that each slot is individually enabled
2. Verify each slot has a script pasted
3. Different ad networks may have different requirements
4. Some slots may need specific ad sizes

---

## Best Practices

✅ **DO:**
- Enable only the slots you have ad scripts for
- Use matching ad sizes (728×90 for leaderboard, 300×250 for rectangle)
- Wait 24-48 hours after enabling for ads to appear
- Monitor ad performance in your ad network dashboard
- Test on different devices (desktop, mobile, tablet)
- Use reputable ad networks (Google AdSense, Mediavine, etc.)

❌ **DON'T:**
- Enable all slots at once without scripts
- Paste incomplete or modified ad code
- Click your own ads (violates ad network policies)
- Use multiple ad networks in the same slot
- Disable/enable slots frequently
- Share your ad network credentials

---

## Revenue Tips

1. **Place ads strategically**: Header and mobile sticky footer get most clicks
2. **Use multiple ad networks**: Different networks have different rates
3. **Optimize ad sizes**: 300×250 and 728×90 perform best
4. **Increase traffic**: More visitors = more ad impressions = more revenue
5. **Monitor performance**: Check which slots perform best
6. **A/B test**: Try different ad networks and placements

---

## Support

For issues with:
- **Ad Network Setup**: Contact your ad network support
- **NewsFlash Ad Management**: Check this guide or contact support@newsflash.in
- **Ad Code Issues**: Verify the code with your ad network

---

**Last Updated**: May 2026
**Version**: 1.0
