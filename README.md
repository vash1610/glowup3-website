# GlowUp3 Website for Vercel

Marketing website for **todaylytesting.xyz** connected to your GlowUp3 Supabase database.

## 🚀 Quick Deployment

### 1. Push to GitHub
```bash
cd vercel-website
git init
git add .
git commit -m "Initial Vercel website"
git remote add origin https://github.com/YOUR_USERNAME/glowup3-website.git
git push -u origin main
```

### 2. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repo
4. Add environment variables:
   - `EXPO_PUBLIC_SUPABASE_URL` = `https://ydnmhnutaitmbeybpwxc.supabase.co`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` = (your anon key from Supabase)

### 3. Connect Domain
1. In Vercel dashboard → Settings → Domains
2. Add `todaylytesting.xyz`
3. Update DNS records as instructed

## 📁 Project Structure

```
vercel-website/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout with metadata
│   │   ├── page.tsx        # Home page (marketing)
│   │   └── globals.css     # Global styles
│   └── lib/
│       └── supabase.ts    # Supabase client
├── vercel.json            # Vercel config
├── package.json
├── tsconfig.json
└── .env.example          # Environment template
```

## 🔗 Supabase Connection

Your website connects to:
- **Project ID**: `ydnmhnutaitmbeybpwxc`
- **Database**: All GlowUp3 tables
- **Functions**: 50+ database functions available
- **Triggers**: 35 triggers for real-time updates

## 📱 What This Website Includes

- ✅ Marketing landing page
- ✅ Feature showcase (Booking, Messaging, Payments, etc.)
- ✅ Supabase integration ready
- ✅ Mobile responsive design

## 🔧 Future Additions (Optional)

You can expand this website with:
- `/pros` - Browse professionals
- `/services` - View service categories  
- `/about` - About page
- `/admin` - Pro dashboard (requires auth)
- `/register` - Sign up as pro or customer

## 📊 Database Features Available

| Feature | Supabase Function | Description |
|---------|------------------|-------------|
| Booking | `create_appointment`, `get_available_slots` | Appointment booking system |
| Messaging | `send_message`, `mark_read` | Real-time messaging |
| Payments | `calculate_reservation_fee` | Stripe integration |
| Wallets | `credit_wallet`, `debit_wallet` | Wallet balance management |
| Gifts | `claim_gift_card`, `claim_gift_item` | Gift card system |
| Reviews | `create_review`, `calculate_rating` | Review management |

---

**Note**: These TypeScript errors in VS Code will resolve after running `npm install`
