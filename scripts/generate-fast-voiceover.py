import asyncio
import os
import edge_tts

VOICE = "en-NG-AbeoNeural"
RATE = "+10%"

SCENES = [
    {
        "id": "scene1_intro",
        "title": "Introduction & Sovereign Custody",
        "text": "Every year, billions in crypto assets and private keys are lost forever when holders become incapacitated. Traditional solutions require centralized trust. Welcome to Hierkey: the sovereign dead man's switch and confidential document custody protocol built on NEAR Protocol."
    },
    {
        "id": "scene2_dashboard",
        "title": "Real-time Dashboard & Autonomous Keepers",
        "text": "On the Hierkey dashboard, track on-chain heartbeat timers, guardian approvals, and cryptographic custody in real time. Powered by NEAR Function-Call Access Keys, decentralized keeper bots monitor heartbeat expirations and execute authorized inheritance triggers without ever accessing user funds."
    },
    {
        "id": "scene3_vaults",
        "title": "Access Vault Creation & Shamir Thresholds",
        "text": "Creating an Access Vault takes seconds. Name your vault, designate trusted guardians, and configure a Shamir multi-signature threshold with a sixty-day heartbeat window. One click invokes the NEAR smart contract, establishing your sovereign vault on-chain."
    },
    {
        "id": "scene4_documents",
        "title": "Client-side ECIES Encryption & Pinata IPFS",
        "text": "In the Documents center, sensitive recovery phrases and legal documents are encrypted client-side using ECIES before being decentralized and pinned to IPFS via Pinata. Only cryptographic commitments live on NEAR, ensuring mathematical privacy and tamper-proof custody."
    },
    {
        "id": "scene5_heartbeat_conclusion",
        "title": "Proof of Life Heartbeat & Live NEAR Testnet",
        "text": "Maintaining custody is as effortless as a single heartbeat. With one click, broadcast a Proof of Life transaction to reset the countdown timer for sub-cent gas. Hierkey is live on NEAR Testnet at hierkey.web.app. Protect your digital legacy today."
    }
]

async def main():
    os.makedirs("recordings/audio", exist_ok=True)
    
    full_text = " ".join([s["text"] for s in SCENES])
    print(f"Generating voiceover with voice: {VOICE} at rate: {RATE}")
    
    # Save full voiceover
    comm_full = edge_tts.Communicate(full_text, VOICE, rate=RATE)
    await comm_full.save("recordings/full_voiceover.mp3")
    print("Saved recordings/full_voiceover.mp3")

    total_duration = 0
    import subprocess
    
    # Generate each scene
    for s in SCENES:
        p = f"recordings/audio/{s['id']}.mp3"
        comm = edge_tts.Communicate(s["text"], VOICE, rate=RATE)
        await comm.save(p)
        print(f"Saved {p}")

if __name__ == "__main__":
    asyncio.run(main())

