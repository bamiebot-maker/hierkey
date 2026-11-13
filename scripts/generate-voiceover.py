import asyncio
import os
import edge_tts

VOICE = "en-US-ChristopherNeural"

SCENES = [
    {
        "id": "scene1_intro",
        "text": "Every year, billions of dollars in crypto assets and confidential digital keys are lost forever when holders become incapacitated. Traditional inheritance solutions require trusting third parties or centralized servers. Welcome to Hierkey: the sovereign dead man's switch and confidential document custody protocol built natively on NEAR Protocol."
    },
    {
        "id": "scene2_dashboard",
        "text": "On the Hierkey dashboard, users gain real-time visibility into their custody health. Hierkey tracks on-chain heartbeat timers, pending guardian approvals, and cryptographic custody states. Using NEAR's unique Function-Call Access Keys, decentralized keeper bots can autonomously monitor heartbeat expirations and execute authorized inheritance triggers without ever having access to user assets."
    },
    {
        "id": "scene3_vaults",
        "text": "Creating an Access Vault allows creators to define custom inactivity thresholds, such as thirty or sixty days, and assign trusted guardians. Utilizing Shamir's Secret Sharing, the master decryption key is mathematically split into multiple encrypted shards, ensuring no single entity can access your secrets prematurely."
    },
    {
        "id": "scene4_documents",
        "text": "In the Documents center, sensitive files, private seed phrases, and legal wills are encrypted client-side using ECIES before being decentralized and pinned across IPFS with Pinata. Only the on-chain cryptographic commitment is stored on NEAR, ensuring mathematical privacy and tamper-proof custody."
    },
    {
        "id": "scene5_heartbeat",
        "text": "Maintaining custody is as effortless as a single heartbeat. With one click, the creator broadcasts a Proof of Life transaction to the NEAR smart contract, refreshing the countdown timer with near-zero gas fees. If the owner ever becomes permanently inactive, the contract autonomously unlocks the threshold guardian release process."
    },
    {
        "id": "scene6_conclusion",
        "text": "Hierkey bridges personal digital sovereignty with decentralized inheritance and confidential document custody. Live on NEAR Testnet at hierkey.web.app. Protect your digital legacy today."
    }
]

async def main():
    os.makedirs("recordings/audio", exist_ok=True)
    full_text = " ".join([s["text"] for s in SCENES])
    
    print("Generating full voiceover track...")
    communicate = edge_tts.Communicate(full_text, VOICE, rate="+3%")
    await communicate.save("recordings/full_voiceover.mp3")
    print("Saved recordings/full_voiceover.mp3")

    for scene in SCENES:
        path = f"recordings/audio/{scene['id']}.mp3"
        comm = edge_tts.Communicate(scene["text"], VOICE, rate="+3%")
        await comm.save(path)
        print(f"Saved {path}")

if __name__ == "__main__":
    asyncio.run(main())

