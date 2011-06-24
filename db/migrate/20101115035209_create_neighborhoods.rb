class CreateNeighborhoods < ActiveRecord::Migration
  def self.up
    create_table :neighborhoods do |t|
      t.string :name
      t.decimal :latitude, :decimal, :precision => 15, :scale => 10
      t.decimal :longitude, :decimal, :precision => 15, :scale => 10
      t.integer :zoom

      t.timestamps
    end
  end

  def self.down
    drop_table :neighborhoods
  end
end
