// Unutar tvoje komponente, funkcija za Sync:
const runSync = async () => {
  setLoading(true);
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/api/system/sync`, { 
      method: 'POST', 
      body: JSON.stringify({ 
        userId: user.id,
        repo: "nermindurma81-ui/Kralj-backup" // ISPRAVLJENO
      }) 
    });
    if (res.ok) alert("Kralj je uspješno ažuriran! 👑");
  } catch (err) {
    alert("Greška pri sinkronizaciji.");
  } finally {
    setLoading(false);
  }
};
