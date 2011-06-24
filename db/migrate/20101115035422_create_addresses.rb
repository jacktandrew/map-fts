class CreateAddresses < ActiveRecord::Migration
  def self.up
    create_table :addresses do |t|
      t.belongs_to :neighborhood
      t.belongs_to :spot
      t.decimal :latitude, :decimal, :precision => 15, :scale => 10
      t.decimal :longitude, :decimal, :precision => 15, :scale => 10
      t.string :address
      t.string :city
      t.string :state
      t.string :zip
      t.boolean :sunday
      t.boolean :monday
      t.boolean :tuesday
      t.boolean :wednesday
      t.boolean :thursday
      t.boolean :friday
      t.boolean :saturday

      t.timestamps
    end
  end

  def self.down
    drop_table :addresses
  end
end
