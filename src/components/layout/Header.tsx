export function Header() {
  return (
    <header className="fixed top-0 left-[260px] right-0 h-20 bg-background/90 backdrop-blur-xl z-40 px-lg flex items-center justify-end gap-xl">
      <div className="relative flex items-center bg-surface-container-high px-md py-2 rounded-lg group transition-all w-72">
        <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
        <input 
          className="bg-transparent border-none outline-none text-body-md px-sm w-full text-on-surface" 
          placeholder="Search..." 
          type="text"
        />
      </div>
      <div className="flex items-center gap-md">
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container text-on-surface-variant transition-colors">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </button>
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary text-[20px]">person</span>
        </div>
      </div>
    </header>
  )
}
